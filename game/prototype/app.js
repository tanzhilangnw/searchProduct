/* LQA Radar — 纯前端本地化文案体检原型
 * 规则引擎 + 术语表 + 长度模型；不调用任何付费 API。
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 0. 基础常量
   * ------------------------------------------------------------------ */
  const LOCALES = {
    en: { label: 'English', short: 'EN', dir: 'ltr' },
    ja: { label: '日本語', short: 'JA', dir: 'ltr' },
    ko: { label: '한국어', short: 'KO', dir: 'ltr' }
  };

  const SEVERITY = {
    critical: { label: '阻塞', weight: 10, order: 0 },
    high: { label: '高危', weight: 7, order: 1 },
    medium: { label: '中危', weight: 3, order: 2 },
    low: { label: '提示', weight: 1, order: 3 }
  };

  const TYPE_LABEL = {
    missing: '缺失翻译',
    placeholder: '占位符不一致',
    html: '富文本标签',
    overflow: '文本溢出',
    near_limit: '接近上限',
    glossary: '术语不一致',
    punctuation: '标点/全半角',
    whitespace: '空格问题',
    untranslated: '未翻译',
    cjk: '中文残留',
    number: '数字不一致',
    repetition: '重复用词',
    too_short: '疑似截断'
  };

  /* 术语表：源文术语 -> 各语言唯一正确译法 + 常见错译（用于一键修复） */
  const GLOSSARY = [
    { term: '灵石', en: 'Spirit Stone', ja: '霊石', ko: '영석',
      variants: { en: ['Immortal Stone', 'Soul Stone', 'SpiritStone'], ja: ['魂石', '霊魂石'], ko: ['영혼석', '령석'] } },
    { term: '丹药', en: 'Pill', ja: '丹薬', ko: '단약',
      variants: { en: ['Elixir', 'Medicine'], ja: ['丹薬', '霊薬'], ko: ['영약'] } },
    { term: '宗门', en: 'Sect', ja: '宗門', ko: '종문',
      variants: { en: ['Clan', 'School'], ja: ['宗派'], ko: ['종파'] } },
    { term: '师父', en: 'Master', ja: '師匠', ko: '사부',
      variants: { en: ['Teacher', 'Sensei'], ja: ['先生'], ko: ['스승'] } },
    { term: '修仙', en: 'Cultivation', ja: '修行', ko: '수선',
      variants: { en: ['Immortal Cultivation', 'Xiuxian'], ja: ['修仙', '仙術'], ko: ['수련'] } }
  ];

  /* 示例项目：38 个 key × 3 语言 = 114 行 */
  const SAMPLE_KEYS = [
    { key: 'ui.start', source: '开始游戏', maxLen: 14, context: '主菜单按钮' },
    { key: 'ui.settings', source: '设置', maxLen: 10, context: '主菜单' },
    { key: 'ui.shop', source: '商店', maxLen: 10, context: '主城入口' },
    { key: 'ui.confirm', source: '确定', maxLen: 8, context: '通用按钮' },
    { key: 'ui.cancel', source: '取消', maxLen: 10, context: '通用按钮' },
    { key: 'ui.back', source: '返回', maxLen: 8, context: '通用按钮' },
    { key: 'ui.next', source: '下一步', maxLen: 10, context: '新手引导' },
    { key: 'ui.close', source: '关闭', maxLen: 8, context: '弹窗' },
    { key: 'ui.quit', source: '退出游戏', maxLen: 12, context: '设置页' },
    { key: 'ui.continue', source: '继续', maxLen: 10, context: '暂停菜单' },
    { key: 'ui.newgame', source: '新游戏', maxLen: 10, context: '主菜单' },
    { key: 'ui.loadgame', source: '读取存档', maxLen: 12, context: '主菜单' },
    { key: 'ui.save', source: '保存', maxLen: 8, context: '存档' },
    { key: 'ui.fullscreen', source: '全屏', maxLen: 12, context: '设置页' },
    { key: 'setting.language', source: '语言', maxLen: 10, context: '设置页' },
    { key: 'setting.sound', source: '音效', maxLen: 8, context: '设置页' },
    { key: 'setting.music', source: '音乐', maxLen: 8, context: '设置页' },
    { key: 'dialog.greeting', source: '你好，{player}！', maxLen: 28, context: 'NPC 初见' },
    { key: 'npc.teacher', source: '师父', maxLen: 10, context: '角色名' },
    { key: 'npc.teacher.line1', source: '你终于来了，{player}。', maxLen: 36, context: '对话' },
    { key: 'npc.teacher.line2', source: '修仙之路，始于足下。', maxLen: 60, context: '对话' },
    { key: 'item.spirit_stone', source: '灵石', maxLen: 16, context: '道具名' },
    { key: 'item.spirit_stone.desc', source: '蕴含灵气的石头。', maxLen: 40, context: '道具描述' },
    { key: 'item.pill', source: '丹药', maxLen: 10, context: '道具名' },
    { key: 'item.pill.desc', source: '恢复少量气血。', maxLen: 32, context: '道具描述' },
    { key: 'quest.title', source: '初入宗门', maxLen: 28, context: '任务标题' },
    { key: 'quest.desc', source: '前往山门，寻找掌门。', maxLen: 48, context: '任务描述' },
    { key: 'mail.reward', source: '恭喜获得{count}个{item}！', maxLen: 36, context: '邮件' },
    { key: 'shop.price', source: '价格：{price}灵石', maxLen: 32, context: '商店' },
    { key: 'ui.insufficient', source: '灵石不足', maxLen: 26, context: '商店' },
    { key: 'ui.purchase', source: '购买', maxLen: 8, context: '商店' },
    { key: 'ui.success', source: '购买成功！', maxLen: 22, context: '商店' },
    { key: 'ui.fail', source: '购买失败，请稍后再试。', maxLen: 48, context: '商店' },
    { key: 'tip.loading', source: '加载中...', maxLen: 14, context: '加载' },
    { key: 'tip.network', source: '网络连接失败，请重试。', maxLen: 56, context: '网络' },
    { key: 'battle.win', source: '胜利！', maxLen: 10, context: '战斗结算' },
    { key: 'battle.lose', source: '失败...', maxLen: 10, context: '战斗结算' },
    { key: 'ui.warning', source: '注意：<b>危险</b>', maxLen: 28, context: '警告弹窗' }
  ];

  const BASE = {
    en: {
      'ui.start': 'Start Game', 'ui.settings': 'Settings', 'ui.shop': 'Shop',
      'ui.confirm': 'OK', 'ui.cancel': 'Cancel', 'ui.back': 'Back',
      'ui.next': 'Next', 'ui.close': 'Close', 'ui.quit': 'Quit Game',
      'ui.continue': 'Continue', 'ui.newgame': 'New Game', 'ui.loadgame': 'Load Game',
      'ui.save': 'Save', 'ui.fullscreen': 'Fullscreen', 'setting.language': 'Language',
      'setting.sound': 'Sound', 'setting.music': 'Music',
      'dialog.greeting': 'Hello, {player}!', 'npc.teacher': 'Master',
      'npc.teacher.line1': "You're finally here, {player}.",
      'npc.teacher.line2': 'The path of cultivation begins with a single step.',
      'item.spirit_stone': 'Spirit Stone', 'item.spirit_stone.desc': 'A stone imbued with spiritual energy.',
      'item.pill': 'Pill', 'item.pill.desc': 'Restores a small amount of HP.',
      'quest.title': 'First Steps into the Sect', 'quest.desc': 'Head to the sect gate and find the leader.',
      'mail.reward': 'You received {count} {item}(s)!', 'shop.price': 'Price: {price} Spirit Stones',
      'ui.insufficient': 'Not enough Spirit Stones', 'ui.purchase': 'Purchase',
      'ui.success': 'Purchase successful!', 'ui.fail': 'Purchase failed. Please try again later.',
      'tip.loading': 'Loading...', 'tip.network': 'Network connection failed. Please try again.',
      'battle.win': 'Victory!', 'battle.lose': 'Defeat...', 'ui.warning': 'Warning: <b>Danger</b>'
    },
    ja: {
      'ui.start': 'ゲーム開始', 'ui.settings': '設定', 'ui.shop': 'ショップ',
      'ui.confirm': 'OK', 'ui.cancel': 'キャンセル', 'ui.back': '戻る',
      'ui.next': '次へ', 'ui.close': '閉じる', 'ui.quit': 'ゲームを終了',
      'ui.continue': '続ける', 'ui.newgame': '新しいゲーム', 'ui.loadgame': 'セーブを読み込む',
      'ui.save': '保存', 'ui.fullscreen': '全画面', 'setting.language': '言語',
      'setting.sound': '効果音', 'setting.music': '音楽',
      'dialog.greeting': 'こんにちは、{player}さん！', 'npc.teacher': '師匠',
      'npc.teacher.line1': 'よく来たな、{player}。',
      'npc.teacher.line2': '修行の道は、足元から始まる。',
      'item.spirit_stone': '霊石', 'item.spirit_stone.desc': '霊気を宿した石。',
      'item.pill': '丹薬', 'item.pill.desc': 'HPを少し回復する。',
      'quest.title': '初めての宗門', 'quest.desc': '山門へ向かい、宗主を探そう。',
      'mail.reward': 'おめでとう！{count}個の{item}を獲得しました！', 'shop.price': '価格：{price}霊石',
      'ui.insufficient': '霊石が足りません', 'ui.purchase': '購入',
      'ui.success': '購入成功！', 'ui.fail': '購入に失敗しました。後でもう一度お試しください。',
      'tip.loading': '読み込み中...', 'tip.network': 'ネットワーク接続に失敗しました。もう一度お試しください。',
      'battle.win': '勝利！', 'battle.lose': '敗北...', 'ui.warning': '注意：<b>危険</b>'
    },
    ko: {
      'ui.start': '게임 시작', 'ui.settings': '설정', 'ui.shop': '상점',
      'ui.confirm': '확인', 'ui.cancel': '취소', 'ui.back': '뒤로',
      'ui.next': '다음', 'ui.close': '닫기', 'ui.quit': '게임 종료',
      'ui.continue': '계속', 'ui.newgame': '새 게임', 'ui.loadgame': '불러오기',
      'ui.save': '저장', 'ui.fullscreen': '전체 화면', 'setting.language': '언어',
      'setting.sound': '효과음', 'setting.music': '음악',
      'dialog.greeting': '안녕하세요, {player}님!', 'npc.teacher': '사부',
      'npc.teacher.line1': '드디어 오셨군요, {player}.',
      'npc.teacher.line2': '수선의 길은 발밑에서 시작된다.',
      'item.spirit_stone': '영석', 'item.spirit_stone.desc': '영기를 품은 돌.',
      'item.pill': '단약', 'item.pill.desc': 'HP를 조금 회복합니다.',
      'quest.title': '첫 종문', 'quest.desc': '산문으로 가서 종주를 찾으세요.',
      'mail.reward': '축하합니다! {count}개의 {item}을 획득했습니다!', 'shop.price': '가격: {price} 영석',
      'ui.insufficient': '영석이 부족합니다', 'ui.purchase': '구매',
      'ui.success': '구매 성공!', 'ui.fail': '구매에 실패했습니다. 나중에 다시 시도해 주세요.',
      'tip.loading': '로딩 중...', 'tip.network': '네트워크 연결에 실패했습니다. 다시 시도해 주세요.',
      'battle.win': '승리!', 'battle.lose': '패배...', 'ui.warning': '주의: <b>위험</b>'
    }
  };

  /* 故意注入的问题：每个语言挑几条，覆盖所有检查类型 */
  const MUTATIONS = [
    { locale: 'en', key: 'ui.settings', target: '' },
    { locale: 'en', key: 'dialog.greeting', target: 'Hello, {name}!' },
    { locale: 'en', key: 'item.spirit_stone', target: 'Immortal Stone' },
    { locale: 'en', key: 'item.spirit_stone.desc', target: 'A stone that contains spiritual energy. It is very useful for cultivation and can be used to refine pills and upgrade equipment.' },
    { locale: 'en', key: 'ui.success', target: 'Purchase successful！' },
    { locale: 'en', key: 'ui.confirm', target: '<b>OK</b' },
    { locale: 'en', key: 'ui.continue', target: ' Continue' },
    { locale: 'en', key: 'ui.close', target: '关闭' },
    { locale: 'en', key: 'ui.warning', target: 'Warning: <b>Danger' },
    { locale: 'en', key: 'shop.price', target: 'Price: {price} Immortal Stones' },
    { locale: 'en', key: 'npc.teacher.line2', target: 'The path of cultivation begins with a single step. It is long and full of trials.' },
    { locale: 'ja', key: 'ui.fullscreen', target: '' },
    { locale: 'ja', key: 'mail.reward', target: 'おめでとう！{count}個のアイテムを獲得しました！' },
    { locale: 'ja', key: 'item.spirit_stone', target: '魂石' },
    { locale: 'ja', key: 'quest.desc', target: '山門へ向かい、宗主を探そう。道中には危険な妖怪が潜んでいるため、装備を整えてから出発してください。' },
    { locale: 'ja', key: 'npc.teacher.line2', target: '修仙の道は、足元から始まる。' },
    { locale: 'ja', key: 'ui.save', target: '保存 ' },
    { locale: 'ko', key: 'setting.sound', target: '' },
    { locale: 'ko', key: 'dialog.greeting', target: '안녕하세요, {name}님!' },
    { locale: 'ko', key: 'item.spirit_stone', target: '영혼석' },
    { locale: 'ko', key: 'item.spirit_stone.desc', target: '영기를 품은 돌입니다. 수련에 매우 유용하며, 단약을 제련하거나 장비를 업그레이드하는 데 사용할 수 있습니다.' },
    { locale: 'ko', key: 'ui.loadgame', target: '读取存档' },
    { locale: 'ko', key: 'ui.fail', target: '구매에 실패했습니다. 나중에 다시 시도해 주세요！' },
    { locale: 'ko', key: 'ui.save', target: '저장 ' }
  ];

  /* ------------------------------------------------------------------ *
   * 1. 状态
   * ------------------------------------------------------------------ */
  const state = {
    project: '《灵石纪元》出海版',
    rows: [],
    issues: [],
    tab: 'issues',
    severity: 'all',
    locale: 'all',
    q: '',
    applied: 0,
    lastScan: new Date()
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function locMeta(code) {
    return LOCALES[code] || { label: String(code || '').toUpperCase(), short: String(code || '').slice(0, 3).toUpperCase() };
  }

  /* ------------------------------------------------------------------ *
   * 2. 工具
   * ------------------------------------------------------------------ */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  function highlight(s) {
    return esc(s).replace(/\{[^{}]+\}/g, '<span class="mark">$&</span>');
  }

  function isBlank(s) { return !s || !String(s).trim(); }

  function varTokens(s) {
    const out = [];
    const re = /\{[^{}]+\}|%\d+\$[sd]|%[sd]|\\n/g;
    let m;
    while ((m = re.exec(s || ''))) out.push(m[0]);
    return out;
  }

  function normalizeVar(t) { return t.replace(/\s+/g, ''); }

  function tagTokens(s) {
    const out = [];
    const re = /<\/?[a-zA-Z][^>]*>/g;
    let m;
    while ((m = re.exec(s || ''))) out.push(m[0].replace(/\s+/g, '').toLowerCase());
    return out;
  }

  function tagNames(tags) {
    const map = {};
    tags.forEach((t) => {
      const m = t.match(/^<\/?([a-z0-9]+)/);
      if (!m) return;
      const name = m[1];
      map[name] = map[name] || { open: 0, close: 0 };
      if (t.startsWith('</')) map[name].close++;
      else map[name].open++;
    });
    return map;
  }

  const HAN = /[\u4e00-\u9fff]/;
  const HANGUL = /[\uac00-\ud7af]/;
  const SIMPLIFIED_ONLY = /[灵门师药战关选这个们]/;
  const CN_GAME_WORDS = /修仙|灵石|宗门|丹药|师父|玩家|开始游戏|读取存档/;

  function hasCjkLeak(locale, target) {
    if (!target) return false;
    if (locale === 'en' || locale === 'ko') return HAN.test(target);
    if (locale === 'ja') return SIMPLIFIED_ONLY.test(target) || CN_GAME_WORDS.test(target);
    return false;
  }

  function fullWidthPunct(s) {
    return /[\u3000-\u303f\uff01-\uff5e]/.test(s || '');
  }

  function toHalfWidth(s) {
    return String(s).replace(/[\u3000-\u303f\uff01-\uff5e]/g, (ch) => {
      const code = ch.charCodeAt(0);
      if (code === 0x3000) return ' ';
      if (code >= 0xff01 && code <= 0xff5e) return String.fromCharCode(code - 0xfee0);
      return ch;
    });
  }

  function countBy(arr, fn) {
    return arr.reduce((acc, x) => { const k = fn(x); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  }

  /* ------------------------------------------------------------------ *
   * 3. 示例数据
   * ------------------------------------------------------------------ */
  function buildSampleRows() {
    const rows = [];
    const locales = ['en', 'ja', 'ko'];
    for (const locale of locales) {
      for (const k of SAMPLE_KEYS) {
        let target = BASE[locale][k.key] != null ? BASE[locale][k.key] : '';
        const mut = MUTATIONS.find((m) => m.locale === locale && m.key === k.key);
        if (mut) target = mut.target;
        rows.push({
          key: k.key, locale, source: k.source, target,
          maxLen: k.maxLen, context: k.context
        });
      }
    }
    return rows;
  }

  /* ------------------------------------------------------------------ *
   * 4. 扫描引擎
   * ------------------------------------------------------------------ */
  function scan(rows) {
    const issues = [];
    let seq = 0;
    const push = (row, type, severity, why, fix, extra) => {
      issues.push(Object.assign({
        id: 'i' + (++seq), key: row.key, locale: row.locale,
        source: row.source, target: row.target, maxLen: row.maxLen,
        context: row.context, type, severity, why, fix
      }, extra || {}));
    };

    for (const row of rows) {
      const { locale, source, target, maxLen } = row;
      const t = target == null ? '' : String(target);
      const s = source == null ? '' : String(source);

      /* 4.1 空值 */
      if (isBlank(t)) {
        push(row, 'missing', 'critical',
          '目标语言为空。上线后玩家会看到空白按钮或回退到中文。',
          '补译这一条；如果该语言暂不上线，从发布包里剔除并标记 TODO。');
        continue;
      }

      /* 4.2 未翻译 */
      if (t.trim() === s.trim()) {
        const sameIsOkJa = locale === 'ja' && !SIMPLIFIED_ONLY.test(t) && !CN_GAME_WORDS.test(t);
        if (!sameIsOkJa) push(row, 'untranslated', 'high',
          '目标文案和源文完全相同，说明这一条被直接复制了。',
          '补译；不要用源文兜底，尤其是按钮和任务描述。');
      }

      /* 4.3 占位符 */
      const sv = varTokens(s).filter((x) => !x.startsWith('<'));
      const tv = varTokens(t).filter((x) => !x.startsWith('<'));
      const svNorm = sv.map(normalizeVar);
      const tvNorm = tv.map(normalizeVar);
      const missingVars = svNorm.filter((x) => !tvNorm.includes(x));
      const extraVars = tvNorm.filter((x) => !svNorm.includes(x));
      const spacedVar = /\{[^{}]*\s+[^{}]*\}/.test(t) || /\{[^{}]*\s+[^{}]*\}/.test(s);
      if (missingVars.length || extraVars.length) {
        const parts = [];
        if (missingVars.length) parts.push('缺少 ' + missingVars.join('、'));
        if (extraVars.length) parts.push('多出 ' + extraVars.join('、'));
        const auto = (missingVars.length === 1 && extraVars.length === 1)
          ? t.replace(new RegExp(extraVars[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), missingVars[0])
          : null;
        push(row, 'placeholder', 'critical',
          '占位符是运行时替换的变量，写法必须和源文完全一致：' + parts.join('；') + '。',
          missingVars.length === 1 && extraVars.length === 1
            ? '把 ' + extraVars[0] + ' 改回 ' + missingVars[0] + '。'
            : '按源文补齐/删除占位符：' + (missingVars.join('、') || '无') + '。',
          auto ? { autoFix: auto } : null);
      } else if (spacedVar) {
        push(row, 'whitespace', 'low',
          '占位符内部出现了空格，部分运行时会把 { player } 当成另一个变量。',
          '去掉占位符内的空格，写成 {player}。');
      }

      /* 4.4 富文本标签 */
      const st = tagTokens(s);
      const tt = tagTokens(t);
      if (st.length || tt.length) {
        const sm = tagNames(st);
        const tm = tagNames(tt);
        const names = new Set([...Object.keys(sm), ...Object.keys(tm)]);
        let broken = false;
        const details = [];
        for (const name of names) {
          const a = sm[name] || { open: 0, close: 0 };
          const b = tm[name] || { open: 0, close: 0 };
          if (a.open !== b.open || a.close !== b.close) {
            broken = true;
            details.push(`<${name}> 源文 ${a.open}/${a.close}，目标 ${b.open}/${b.close}`);
          }
        }
        if (broken) {
          const missingClose = Object.keys(tm).filter((n) => tm[n].open > tm[n].close).map((n) => `</${n}>`).join('');
          push(row, 'html', 'high',
            '富文本标签不配对，轻则样式丢失，重则把后面的 UI 全部吞掉。' + details.join('；'),
            missingClose ? '补全闭合标签：' + missingClose : '按源文核对开始/结束标签。',
            missingClose ? { autoFix: t + missingClose } : null);
        }
      }

      /* 4.5 长度溢出 */
      const len = t.length;
      if (maxLen && len > maxLen) {
        push(row, 'overflow', 'high',
          `目标 ${len} 字符，UI 上限 ${maxLen} 字符，超出 ${len - maxLen}。按钮会换行、截断或压到别的控件。`,
          `压到 ${maxLen} 字符内，或和 UI 确认把 maxLen 调到 ${len}。优先改短，不要靠缩小字号。`);
      } else if (maxLen && len > maxLen * 0.92) {
        push(row, 'near_limit', 'low',
          `目标 ${len} 字符，已接近 UI 上限 ${maxLen}；换一种字体或窄屏就可能溢出。`,
          '留出 15% 余量，或确认该控件是否允许换行。');
      }

      /* 4.6 术语 */
      for (const g of GLOSSARY) {
        if (!s.includes(g.term)) continue;
        const expected = g[locale];
        if (!expected) continue;
        if (t.toLowerCase().includes(String(expected).toLowerCase())) continue;
        const variants = (g.variants && g.variants[locale]) || [];
        const hit = variants.find((v) => t.includes(v));
        push(row, 'glossary', 'medium',
          `源文含术语「${g.term}」，${locMeta(locale).label} 应统一译为「${expected}」` +
          (hit ? `，当前用了「${hit}」。` : '，当前没有命中术语表。'),
          `改为「${expected}」；如果这是有意区分，请先更新术语表。`,
          hit ? { term: g.term, expected, variant: hit, autoFix: t.split(hit).join(expected) } : { term: g.term, expected });
      }

      /* 4.7 标点/全半角 */
      if (locale === 'en' || locale === 'ko') {
        if (fullWidthPunct(t)) {
          push(row, 'punctuation', 'medium',
            '英文/韩文文案里出现了全角标点或全角字符，排版会和字体不匹配。',
            '统一改成半角标点。',
            { autoFix: toHalfWidth(t) });
        }
      }

      /* 4.8 空格 */
      if (t !== t.trim()) {
        push(row, 'whitespace', 'low',
          '目标文案首尾有空格，可能在按钮里造成视觉偏移。',
          '去掉首尾空格。',
          { autoFix: t.trim() });
      } else if (/\s{2,}/.test(t)) {
        push(row, 'whitespace', 'low',
          '目标文案里有连续空格。',
          '合并成一个空格。',
          { autoFix: t.replace(/\s{2,}/g, ' ') });
      } else if (/\s+[,.;:!?]/.test(t)) {
        push(row, 'whitespace', 'low',
          '标点前多了空格。',
          '删掉标点前的空格。',
          { autoFix: t.replace(/\s+([,.;:!?])/g, '$1') });
      }

      /* 4.9 中文残留 */
      if (hasCjkLeak(locale, t)) {
        push(row, 'cjk', 'high',
          locale === 'ja'
            ? '日文里出现了简体中文游戏词或简体字，说明这条可能直接复制了中文源文。'
            : '目标语言里出现了汉字，说明这条没有完成翻译，或混入了中文。',
          locale === 'ja' ? '按日文习惯改写（例如「修仙」→「修行」）。' : '把中文部分翻译成目标语言。');
      }

      /* 4.10 数字 */
      const sn = (s.match(/\d+/g) || []).join(',');
      const tn = (t.match(/\d+/g) || []).join(',');
      if (sn && tn && sn !== tn && !svNorm.some((x) => /\d/.test(x))) {
        push(row, 'number', 'low',
          `源文数字是 ${sn}，目标是 ${tn}；如果不是有意调整，玩家会看到错误的数值。`,
          '核对数字是否应与源文一致。');
      }

      /* 4.11 重复用词 */
      if (locale === 'en' && /\b(\w+)\s+\1\b/i.test(t)) {
        push(row, 'repetition', 'low',
          '英文里出现了连续重复的词。',
          '删掉重复词。');
      }

      /* 4.12 疑似截断 */
      if (t.trim().length > 0 && t.trim().length < 2 && s.trim().length > 4) {
        push(row, 'too_short', 'high',
          '目标只剩 1 个字符，源文却有完整语义，疑似被截断。',
          '检查导出流程是否截断，补全文案。');
      }
    }

    issues.sort((a, b) => {
      const sa = SEVERITY[a.severity].order - SEVERITY[b.severity].order;
      if (sa) return sa;
      const la = a.locale.localeCompare(b.locale);
      if (la) return la;
      return a.key.localeCompare(b.key);
    });
    return issues;
  }

  /* ------------------------------------------------------------------ *
   * 5. 计算
   * ------------------------------------------------------------------ */
  function computeScore() {
    const penalty = state.issues.reduce((sum, i) => sum + SEVERITY[i.severity].weight, 0);
    const score = Math.max(0, Math.round(100 - (penalty * 100) / Math.max(1, state.rows.length * 5)));
    return score;
  }

  function counts() {
    const c = { critical: 0, high: 0, medium: 0, low: 0 };
    state.issues.forEach((i) => { c[i.severity] = (c[i.severity] || 0) + 1; });
    return c;
  }

  function scoreMeta(score) {
    if (score >= 90) return { verdict: '可以提审', desc: '机械级错误基本清零，可以把时间留给语气和文化判断。', color: '#0e9f6e' };
    if (score >= 75) return { verdict: '小修后可提审', desc: '没有结构性风险，但高危项要在提审前处理掉。', color: '#c27803' };
    if (score >= 60) return { verdict: '有明显风险', desc: '阻塞项会直接影响玩家看到的内容，先清零再谈语气。', color: '#e8590c' };
    return { verdict: '不建议提审', desc: '多条阻塞项叠加，提审后大概率出现空白按钮或变量错乱。', color: '#d92d20' };
  }

  /* ------------------------------------------------------------------ *
   * 6. 渲染
   * ------------------------------------------------------------------ */
  function renderAll() {
    state.issues = scan(state.rows);
    state.lastScan = new Date();
    renderHeader();
    renderLocaleNav();
    renderFilters();
    renderIssues();
    renderGlossary();
    renderRaw();
    renderTabs();
  }

  function renderHeader() {
    const score = computeScore();
    const meta = scoreMeta(score);
    const c = counts();

    $('#scoreNum').textContent = score;
    $('#scoreNum').style.color = meta.color;
    $('#scoreVerdict').textContent = meta.verdict;
    $('#scoreDesc').textContent = meta.desc;
    $('#scoreArc').style.stroke = meta.color;
    const circ = 2 * Math.PI * 56;
    $('#scoreArc').style.strokeDashoffset = String(circ * (1 - score / 100));

    $('#statBlocking').textContent = c.critical;
    $('#statHigh').textContent = c.high;
    $('#statMedium').textContent = c.medium;
    $('#statLow').textContent = c.low;

    $('#kpiRows').textContent = state.rows.length;
    $('#kpiIssues').textContent = state.issues.length;
    $('#kpiBlocking').textContent = c.critical;
    $('#kpiReview').textContent = c.critical + c.high;
    $('#kpiIssueSub').textContent = state.issues.length
      ? `平均每 ${Math.max(1, Math.round(state.rows.length / state.issues.length))} 条文案 1 个问题`
      : '没有发现问题';

    $('#projectName').textContent = state.project;
    $('#rowCount').textContent = state.rows.length;
    $('#projectBar').style.width = score + '%';
    $('#tabIssueCount').textContent = state.issues.length;
    $('#scanTime').textContent = state.lastScan.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function renderLocaleNav() {
    const byLoc = countBy(state.issues, (i) => i.locale);
    const totalByLoc = countBy(state.rows, (r) => r.locale);
    const nav = $('#localeNav');
    nav.innerHTML = Object.keys(LOCALES).map((loc) => {
      const n = byLoc[loc] || 0;
      const total = totalByLoc[loc] || 0;
      return `<button class="locale-btn ${state.locale === loc ? 'active' : ''}" data-loc="${loc}">
        <span class="locale-code">${LOCALES[loc].short}</span>
        <span class="locale-name">${LOCALES[loc].label}</span>
        <span class="locale-count"><b>${n}</b>/${total}</span>
      </button>`;
    }).join('');
    nav.querySelectorAll('.locale-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const loc = btn.dataset.loc;
        state.locale = state.locale === loc ? 'all' : loc;
        syncFilterChips();
        renderLocaleNav();
        renderIssues();
      });
    });
  }

  function renderFilters() {
    const c = counts();
    const sevMap = { all: state.issues.length, critical: c.critical, high: c.high, medium: c.medium, low: c.low };
    const sevLabels = { all: '全部', critical: '阻塞', high: '高危', medium: '中危', low: '提示' };
    $('#severityFilters').innerHTML = Object.keys(sevLabels).map((k) =>
      `<button class="chip ${state.severity === k ? 'active' : ''}" data-sev="${k}">${sevLabels[k]}<span class="n">${sevMap[k]}</span></button>`
    ).join('');

    const byLoc = countBy(state.issues, (i) => i.locale);
    $('#localeFilters').innerHTML =
      `<button class="chip ${state.locale === 'all' ? 'active' : ''}" data-loc="all">全部语言</button>` +
      Object.keys(LOCALES).map((loc) =>
        `<button class="chip ${state.locale === loc ? 'active' : ''}" data-loc="${loc}">${LOCALES[loc].short}<span class="n">${byLoc[loc] || 0}</span></button>`
      ).join('');

    $$('#severityFilters .chip').forEach((chip) => chip.addEventListener('click', () => {
      state.severity = chip.dataset.sev;
      renderFilters();
      renderIssues();
    }));
    $$('#localeFilters .chip').forEach((chip) => chip.addEventListener('click', () => {
      state.locale = chip.dataset.loc;
      renderFilters();
      renderLocaleNav();
      renderIssues();
    }));
  }

  function syncFilterChips() {
    $$('#severityFilters .chip').forEach((c) => c.classList.toggle('active', c.dataset.sev === state.severity));
    $$('#localeFilters .chip').forEach((c) => c.classList.toggle('active', c.dataset.loc === state.locale));
  }

  function filteredIssues() {
    return state.issues.filter((i) => {
      if (state.severity !== 'all' && i.severity !== state.severity) return false;
      if (state.locale !== 'all' && i.locale !== state.locale) return false;
      if (state.q) {
        const q = state.q.toLowerCase();
        const blob = (i.key + ' ' + i.source + ' ' + i.target + ' ' + i.why + ' ' + i.fix + ' ' + (TYPE_LABEL[i.type] || '')).toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }

  function renderIssues() {
    const list = filteredIssues();
    const all = state.issues.length;
    $('#issueSummary').textContent = list.length === all
      ? `共 ${all} 个问题，按严重级别排序。点「应用修复」可以处理能自动改的条目。`
      : `筛选出 ${list.length} / ${all} 个问题。`;
    $('#issueEmpty').hidden = list.length > 0;

    $('#issueList').innerHTML = list.map((i) => {
      const sev = SEVERITY[i.severity];
      const canAuto = !!i.autoFix;
      return `<article class="issue sev-${i.severity}" data-id="${i.id}">
        <div class="issue-top">
          <span class="sev-badge">${sev.label}</span>
          <span class="type-badge">${TYPE_LABEL[i.type] || i.type}</span>
          <span class="issue-key">${esc(i.key)}</span>
          <span class="issue-loc"><span class="loc-pill">${locMeta(i.locale).short}</span>${esc(i.context || '')}</span>
        </div>
        <div class="issue-body">
          <div class="str-box">
            <div class="str-label">源文</div>
            <div class="str-text">${highlight(i.source)}</div>
          </div>
          <div class="str-box">
            <div class="str-label">目标 · ${locMeta(i.locale).label}</div>
            <div class="str-text ${i.type === 'missing' ? 'emptytext' : 'bad'}">${i.type === 'missing' ? '（空）' : highlight(i.target)}</div>
          </div>
        </div>
        <div class="issue-why"><b>为什么是问题：</b>${esc(i.why)}</div>
        <div class="issue-fix">
          <span class="fix-label">建议</span>
          <span class="fix-text">${esc(i.fix)}</span>
          ${canAuto
            ? `<button class="apply-btn" data-apply="${i.id}">应用修复</button>`
            : `<span class="applied">需人工处理</span>`}
        </div>
      </article>`;
    }).join('');

    $$('.apply-btn').forEach((btn) => btn.addEventListener('click', () => applyFix(btn.dataset.apply)));
  }

  function applyFix(id) {
    const issue = state.issues.find((i) => i.id === id);
    if (!issue || !issue.autoFix) return;
    const row = state.rows.find((r) => r.key === issue.key && r.locale === issue.locale);
    if (!row) return;
    row.target = issue.autoFix;
    state.applied++;
    toast(`已修复 ${issue.key}（${locMeta(issue.locale).short}），重新扫描中…`);
    renderAll();
  }

  function renderGlossary() {
    const glosIssues = state.issues.filter((i) => i.type === 'glossary');
    const byTerm = {};
    glosIssues.forEach((i) => {
      byTerm[i.term] = byTerm[i.term] || { en: 0, ja: 0, ko: 0 };
      byTerm[i.term][i.locale] = (byTerm[i.term][i.locale] || 0) + 1;
    });
    $('#glossaryBadge').textContent = `${GLOSSARY.length} 个术语`;
    $('#glossaryTable').innerHTML = `
      <div class="gloss-row head"><div>源文术语</div><div>EN</div><div>日本語</div><div>한국어</div></div>
      ` + GLOSSARY.map((g) => {
        const bad = byTerm[g.term] || {};
        const cell = (loc) => `<div class="gloss-cell"><code>${esc(g[loc])}</code>${bad[loc] ? `<span class="gloss-bad">${bad[loc]} 处不一致</span>` : `<span style="color:#0e9f6e;font-size:10px;font-weight:700">✓</span>`}</div>`;
        return `<div class="gloss-row">
          <div class="gloss-term">${esc(g.term)}</div>
          ${cell('en')}${cell('ja')}${cell('ko')}
        </div>`;
      }).join('');
  }

  function rowStatus(row) {
    const own = state.issues.filter((i) => i.key === row.key && i.locale === row.locale);
    if (own.some((i) => i.severity === 'critical')) return { label: '阻塞', cls: 'bad' };
    if (own.some((i) => i.severity === 'high')) return { label: '高危', cls: 'bad' };
    if (own.length) return { label: '有提示', cls: 'warn' };
    return { label: '通过', cls: 'good' };
  }

  function renderRaw() {
    $('#rawCount').textContent = `${state.rows.length} 行`;
    const sorted = state.rows.slice().sort((a, b) => {
      if (a.locale !== b.locale) return a.locale.localeCompare(b.locale);
      return a.key.localeCompare(b.key);
    });
    $('#rawTable').innerHTML = `
      <thead><tr><th>Key</th><th>Locale</th><th>Source</th><th>Target</th><th>Max</th><th>Status</th></tr></thead>
      <tbody>` + sorted.map((r) => {
        const st = rowStatus(r);
        return `<tr>
          <td class="key">${esc(r.key)}</td>
          <td class="mono">${esc(r.locale)}</td>
          <td class="mono" title="${esc(r.source)}">${esc(r.source)}</td>
          <td class="target ${st.cls === 'bad' ? 'bad' : st.cls === 'warn' ? 'warn' : 'good'}" title="${esc(r.target || '')}">${esc(r.target || '—')}</td>
          <td class="mono">${r.maxLen == null ? '—' : r.maxLen}</td>
          <td><span class="type-badge" style="${st.cls === 'bad' ? 'background:#fdeceb;color:#d92d20' : st.cls === 'warn' ? 'background:#fdf6e3;color:#c27803' : 'background:#e8f7f1;color:#0e9f6e'}">${st.label}</span></td>
        </tr>`;
      }).join('') + `</tbody>`;
  }

  function renderTabs() {
    $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === state.tab));
    $$('.panel').forEach((p) => p.classList.toggle('active', p.id === 'panel-' + state.tab));
  }

  /* ------------------------------------------------------------------ *
   * 7. 导入 / 导出
   * ------------------------------------------------------------------ */
  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') quoted = false;
        else cur += ch;
      } else if (ch === '"') {
        quoted = true;
      } else if (ch === ',') {
        row.push(cur); cur = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cur); cur = '';
        if (row.some((c) => c.trim() !== '')) rows.push(row);
        row = [];
      } else {
        cur += ch;
      }
    }
    if (cur !== '' || row.length) { row.push(cur); if (row.some((c) => c.trim() !== '')) rows.push(row); }
    return rows;
  }

  function importCsv(text) {
    const parsed = parseCsv(text);
    if (parsed.length < 2) throw new Error('CSV 里没有数据行');
    const header = parsed[0].map((h) => h.trim().toLowerCase());
    const idx = {
      key: header.indexOf('key'),
      locale: header.indexOf('locale'),
      source: header.indexOf('source'),
      target: header.indexOf('target'),
      maxLen: header.indexOf('maxlen'),
      context: header.indexOf('context')
    };
    if (idx.key < 0 || idx.locale < 0 || idx.source < 0 || idx.target < 0) {
      throw new Error('缺少必需列：key, locale, source, target');
    }
    const rows = [];
    for (let i = 1; i < parsed.length; i++) {
      const r = parsed[i];
      const locale = (r[idx.locale] || '').trim().toLowerCase();
      if (!locale) continue;
      rows.push({
        key: (r[idx.key] || '').trim(),
        locale,
        source: r[idx.source] || '',
        target: r[idx.target] || '',
        maxLen: idx.maxLen >= 0 && r[idx.maxLen] ? parseInt(r[idx.maxLen], 10) : null,
        context: idx.context >= 0 ? (r[idx.context] || '') : ''
      });
    }
    if (!rows.length) throw new Error('没有解析到有效行');
    return rows;
  }

  function exportReport() {
    const score = computeScore();
    const c = counts();
    const meta = scoreMeta(score);
    const lines = [];
    lines.push('# LQA Radar 体检报告');
    lines.push('');
    lines.push(`- 项目：${state.project}`);
    lines.push(`- 时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`);
    lines.push(`- 文案：${state.rows.length} 条 / ${Object.keys(countBy(state.rows, (r) => r.locale)).length} 种语言`);
    lines.push(`- 可上线度：**${score}/100**（${meta.verdict}）`);
    lines.push(`- 问题：阻塞 ${c.critical} · 高危 ${c.high} · 中危 ${c.medium} · 提示 ${c.low}`);
    lines.push('');
    const groups = [
      ['阻塞项（必须清零）', 'critical'],
      ['高危项（提审前处理）', 'high'],
      ['中危项', 'medium'],
      ['提示项', 'low']
    ];
    for (const [label, sev] of groups) {
      const list = state.issues.filter((i) => i.severity === sev);
      if (!list.length) continue;
      lines.push(`## ${label}（${list.length}）`);
      lines.push('');
      for (const i of list) {
        lines.push(`### [${locMeta(i.locale).short}] ${i.key} · ${TYPE_LABEL[i.type]}`);
        lines.push(`- 源文：${i.source}`);
        lines.push(`- 目标：${i.target || '（空）'}`);
        lines.push(`- 问题：${i.why}`);
        lines.push(`- 建议：${i.fix}`);
        lines.push('');
      }
    }
    lines.push('---');
    lines.push('由 LQA Radar 原型生成 · 规则引擎本地运行 · 未调用付费 API');
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lqa-report.md';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('报告已导出：lqa-report.md');
  }

  /* ------------------------------------------------------------------ *
   * 8. Toast
   * ------------------------------------------------------------------ */
  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { el.hidden = true; }, 200);
    }, 2600);
  }

  /* ------------------------------------------------------------------ *
   * 9. 事件绑定
   * ------------------------------------------------------------------ */
  function bind() {
    $('#tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      state.tab = tab.dataset.tab;
      renderTabs();
    });

    $('#searchInput').addEventListener('input', (e) => {
      state.q = e.target.value.trim();
      renderIssues();
    });

    $('#btnReset').addEventListener('click', () => {
      state.rows = buildSampleRows();
      state.project = '《灵石纪元》出海版';
      state.applied = 0;
      renderAll();
      toast('已恢复示例项目');
    });

    $('#btnExport').addEventListener('click', exportReport);

    const modal = $('#importModal');
    const openModal = () => { modal.hidden = false; };
    const closeModal = () => { modal.hidden = true; };
    $('#btnImport').addEventListener('click', openModal);
    $('#btnMethodImport').addEventListener('click', openModal);
    $('#btnCloseModal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

    $('#dropzone').addEventListener('click', () => $('#fileInput').click());
    $('#dropzone').addEventListener('dragover', (e) => { e.preventDefault(); $('#dropzone').classList.add('drag'); });
    $('#dropzone').addEventListener('dragleave', () => $('#dropzone').classList.remove('drag'));
    $('#dropzone').addEventListener('drop', (e) => {
      e.preventDefault();
      $('#dropzone').classList.remove('drag');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) readFile(file);
    });
    $('#fileInput').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) readFile(file);
    });
    $('#btnLoadSample').addEventListener('click', () => {
      state.rows = buildSampleRows();
      state.project = '《灵石纪元》出海版';
      closeModal();
      renderAll();
      toast('已加载示例项目');
    });
  }

  function readFile(file) {
    if (!/\.csv$/i.test(file.name)) { toast('请选择 .csv 文件'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = importCsv(String(reader.result || ''));
        state.rows = rows;
        state.project = file.name.replace(/\.csv$/i, '');
        state.applied = 0;
        $('#importModal').hidden = true;
        renderAll();
        toast(`已导入 ${rows.length} 行文案`);
      } catch (err) {
        toast('导入失败：' + err.message);
      }
    };
    reader.onerror = () => toast('读取文件失败');
    reader.readAsText(file, 'utf-8');
  }

  /* ------------------------------------------------------------------ *
   * 10. 启动
   * ------------------------------------------------------------------ */
  function init() {
    state.rows = buildSampleRows();
    bind();
    renderAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();




