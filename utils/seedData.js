const { getDb } = require('../config/database');
const { initDatabase } = require('./initDb');

const personalityTemplates = [
  { a: 'Ta开朗阳光，像一阵温暖的春风，' },
  { a: 'Ta沉静内敛，眼底藏着星辰大海，' },
  { a: 'Ta古灵精怪，总有新奇的点子让人眼前一亮，' },
  { a: 'Ta温柔细腻，像一杯午后的热茶，' },
  { a: 'Ta自信洒脱，走到哪里都是焦点，' },
  { a: 'Ta成熟稳重，是你可以依靠的港湾，' },
  { a: 'Ta风趣幽默，三句话就能让人忘记烦恼，' },
  { a: 'Ta文艺浪漫，把生活过成了一首诗，' },
  { a: 'Ta热情奔放，像一团永不熄灭的火焰，' },
  { a: 'Ta善解人意，总能一眼看穿你的心事，' },
  { a: 'Ta率真直爽，从不拐弯抹角，' },
  { a: 'Ta神秘迷人，每一个动作都让人想一探究竟，' },
  { a: 'Ta乐观积极，脸上的笑容能融化一切阴霾，' },
  { a: 'Ta心思缜密，做事滴水不漏，' },
  { a: 'Ta自由不羁，像一阵无法捕捉的风，' },
  { a: 'Ta温暖贴心，默默关注着每一个细节，' },
  { a: 'Ta才华横溢，在自己的领域闪闪发光，' },
  { a: 'Ta坚毅果敢，遇到困难从不退缩，' },
  { a: 'Ta灵动聪慧，三言两语就能抓住重点，' },
  { a: 'Ta纯真可爱，保留着最珍贵的那份少年感，' }
];

const destinyTemplates = [
  '命运的红线将你们悄悄牵在一起，这次相遇绝非偶然。',
  '宇宙用了很久很久才让你们相遇，请相信一切都是最好的安排。',
  '前世你们有过未尽的约定，今生终于再次相逢。',
  '你们的缘分写在星星里，无论绕多远的路终究会走到一起。',
  '在人海中擦肩而过的概率是千万分之一，而你们选择了停留。',
  '有些相遇是命中注定的，就像日出和潮汐一样自然。',
  '世界那么大，偏偏是你们被安排在同一时空里。',
  '缘分是一场精心设计的巧合，而你们恰好是主角。',
  '命运给了你们一张特别的通行证，可以进入彼此的世界。',
  '你们的故事从这一刻开始书写，每一页都值得珍藏。',
  '时光会证明你们相遇的意义，安静等待花开的那一天。',
  '两条平行线在某个奇妙的角度交汇，这就是命运的魔法。',
  '你们的相遇是宇宙写给人类最美的情书之一。',
  '千万人之中，你们的目光恰好对上，这概率堪称奇迹。',
  '每个灵魂都有它的另一半轨道，你们正在彼此靠近。'
];

const suggestionTemplates = [
  '今天不妨主动发一条消息，勇敢的人先享受世界。',
  '约Ta去一个安静的地方散步吧，脚步慢下来心跳才会加快。',
  '分享一首你最近单曲循环的歌给Ta，音乐比语言更会表达。',
  '准备一个小惊喜吧，不需要贵重但一定用心。',
  '多问Ta一个问题，了解是从好奇开始的。',
  '今天适合和Ta聊一些轻松的话题，笑声是最好的催化剂。',
  '不妨展示你最擅长的一件事，让Ta看到发光的你。',
  '试着从Ta的角度想问题，理解比喜欢更重要。',
  '带Ta去一个你最喜欢的地方，分享你的世界给Ta。',
  '今天把手机放下一会儿，认真地看着Ta的眼睛说话。',
  '做一件让Ta笑出来的事，哪怕很傻也没关系。',
  '今天适合听Ta说，安静的倾听是最好的陪伴。',
  '给Ta一个真诚的夸奖，具体一点，Ta会记住很久。',
  '勇敢地表达你的感受吧，犹豫才是最大的敌人。',
  '今天做真实的自己就好，最好的吸引力就是做自己。'
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateSeedData() {
  initDatabase();
  const db = getDb();

  db.prepare('DELETE FROM match_seeds').run();

  const insert = db.prepare(
    'INSERT INTO match_seeds (gender_a, gender_b, content) VALUES (?, ?, ?)'
  );

  const insertMany = db.transaction(() => {
    let count = 0;

    function gen(genderA, genderB) {
      const shuffledP = shuffle(personalityTemplates);
      const shuffledD = shuffle(destinyTemplates);
      const shuffledS = shuffle(suggestionTemplates);
      const count2 = Math.min(shuffledP.length, shuffledD.length, shuffledS.length);

      for (let i = 0; i < count2; i++) {
        const p = shuffledP[i];
        const compat = 70 + Math.floor(Math.random() * 30);
        const level = compat >= 90 ? '天作之合' : compat >= 80 ? '非常契合' : '有缘可期';

        const content = JSON.stringify({
          personality: p.a + '与你相遇是最美的意外。',
          destiny: shuffledD[i],
          suggestion: shuffledS[i],
          compatibility: compat,
          level: level
        });

        insert.run(genderA, genderB, content);
        count++;
      }
      return count;
    }

    gen('男', '女');
    gen('女', '男');

    return count;
  });

  const count = insertMany();
  console.log(`Inserted ${count} match seed records`);
}

generateSeedData();
