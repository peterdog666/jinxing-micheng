/* ========================================
   晋行谜城 - 深度升级版游戏主逻辑
   新增：多NPC、多物品、调查进度、线索真假、分层提示
   ======================================== */

// ========================================
// 游戏配置
// ========================================
const CONFIG = {
    PLAYER_SPEED: 2,
    INTERACT_DISTANCE: 80,
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 740,
    FALLBACK_COLOR: '#3a2418',
    INVESTIGATION_REQUIRED: {
        cityGate: 3,      // 古城入口需要调查3个物品
        bank: 3,           // 日升昌票号需要调查3个物品
        escortAgency: 3,   // 镖局旧址需要调查3个物品
        noodleShop: 3,      // 老街面馆需要调查3个物品
        courtyard: 4        // 古宅院落需要调查4个物品
    }
};

// 全局函数：关闭答题窗口并重置游戏状态
function closePuzzleOverlay(overlayId, stateKey) {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    // 重置游戏状态
    if (stateKey === 'isPuzzleActive') {
        GameState.isPuzzleActive = false;
    } else if (stateKey === 'isChoicePuzzleActive') {
        GameState.isChoicePuzzleActive = false;
    } else if (stateKey === 'isPasswordPuzzleActive') {
        GameState.isPasswordPuzzleActive = false;
    }
    
    GameState.isDialogueActive = false;
    GameState.currentNPC = null;
    GameState.currentObject = null;
}

// ========================================
// 地图资源配置
// ========================================
const MAPS = {
    cityGate: {
        name: '古城入口',
        image: 'assets/maps/city_gate.png',
        imageObj: null,
        imageLoaded: false,
        playerStart: { x: 600, y: 600 },
        boundaries: { minX: 50, maxX: 1150, minY: 50, maxY: 690 }
    },
    bank: {
        name: '日升昌票号',
        image: 'assets/maps/bank.png',
        imageObj: null,
        imageLoaded: false,
        playerStart: { x: 600, y: 600 },
        boundaries: { minX: 50, maxX: 1150, minY: 50, maxY: 690 }
    },
    escortAgency: {
        name: '镖局旧址',
        image: 'assets/maps/escort_agency.png',
        imageObj: null,
        imageLoaded: false,
        playerStart: { x: 600, y: 600 },
        boundaries: { minX: 50, maxX: 1150, minY: 50, maxY: 690 }
    },
    noodleShop: {
        name: '老街面馆',
        image: 'assets/maps/noodle_shop.png',
        imageObj: null,
        imageLoaded: false,
        playerStart: { x: 600, y: 600 },
        boundaries: { minX: 50, maxX: 1150, minY: 50, maxY: 690 }
    },
    courtyard: {
        name: '古宅院落',
        image: 'assets/maps/courtyard.png',
        imageObj: null,
        imageLoaded: false,
        playerStart: { x: 600, y: 600 },
        boundaries: { minX: 50, maxX: 1150, minY: 50, maxY: 690 }
    }
};

// ========================================
// 场景配置 - 升级版（多NPC、多物品）
// ========================================
const SCENES = {
    cityGate: {
        title: '古城入口 - 迎薰门',
        npcs: [
            {
                id: 'npc_cityGate_1',
                name: '老讲解员',
                avatar: '👴',
                x: 200,
                y: 150,
                width: 32,
                height: 48,
                color: '#8B4513',
                // 第一阶段对话：介绍背景
                dialogues: [
                    '年轻人，你是第一次来平遥吧？这座古城已经有2800多年的历史了。',
                    '你看这城墙，始建于西周，明代重修，距今已有600多年。',
                    '我在这里守了一辈子，每天都在给游客讲解。最近我在整理史料时，发现了一本残缺的账簿...',
                    '账簿的第一页好像被撕掉了，只剩下"日升昌"和"汇通天下"几个字。',
                    '既然你来了，我就考考你——这座古城始建于哪个朝代？'
                ],
                // NPC提问谜题
                puzzle: {
                    question: '🧩 老讲解员的问题：这座古城始建于哪个朝代？',
                    answer: '西周',
                    hint: '提示：想想城墙的历史，已有2800多年了，中国历史上哪个朝代这么早？',
                    successDialogues: [
                        '没错！就是西周！',
                        '平遥古城始建于西周宣王时期（公元前827-782年），距今已有2800多年历史。',
                        '你很聪明，这本残缺的账簿就交给你了，希望你能解开其中的秘密。'
                    ],
                    reward: 'clue_cityGate_key'  // 回答正确后获得的线索
                },
                hints: [
                    '这座城墙的故事，得从西周说起...',
                    '你想想，中国历史上哪个朝代开始大规模修筑城墙？',
                    '平遥城墙的修建，和一位周朝君主有关...'
                ]
            },
            {
                id: 'npc_cityGate_2',
                name: '游客小孩',
                avatar: '👦',
                x: 300,
                y: 250,
                width: 32,
                height: 48,
                color: '#4169E1',
                dialogues: [
                    '大哥哥，你看城门石刻上有个好可爱的图案！',
                    '好像是一只乌龟！爷爷说平遥城像乌龟，所以叫"龟城"。',
                    '还据说乌龟能活很久，寓意古城长治久安呢！',
                    '你知道平遥古城为什么叫"龟城"吗？'
                ],
                puzzle: {
                    question: '🧩 游客小孩的问题：平遥古城为什么叫"龟城"？\n\nA. 因为城里有很多乌龟\ B. 因为古城形状像乌龟\ C. 因为乌龟是吉祥物\ D. 因为城墙颜色像乌龟壳',
                    answer: 'B',
                    hint: '提示：看看城门石刻上的图案，它揭示了古城的平面布局形状。',
                    successDialogues: [
                        '答对啦！平遥古城的平面布局像一只乌龟：',
                        '南门是龟头，北门是龟尾，东西四门是龟的四肢。',
                        '所以叫"龟城"，寓意长寿安康、固若金汤！'
                    ],
                    reward: 'clue_cityGate_2'
                },
                hints: [
                    '城门石刻上有图案...',
                    '古城的形状像某种动物...',
                    '答案是B，因为古城形状像乌龟'
                ]
            },
            {
                id: 'npc_cityGate_3',
                name: '守门老人',
                avatar: '🧓',
                x: 150,
                y: 350,
                width: 32,
                height: 48,
                color: '#654321',
                dialogues: [
                    '小伙子，知道这城门为什么叫"迎薰门"吗？',
                    '"薰"是温暖的风，南风叫薰风，寓意迎接吉祥。',
                    '过去商队从南边回来，都从这门进，图个好彩头。',
                    '入城有个规矩：先问路，再进城，诚实守信的人才能进。',
                    '那么，"迎薰门"的"薰"指的是什么方向的风？'
                ],
                puzzle: {
                    question: '🧩 守门老人的问题："迎薰门"的"薰"指的是什么方向的风？\n\nA. 北风\ B. 南风\ C. 东风\ D. 西风',
                    answer: 'B',
                    hint: '提示：薰风就是温暖的风，在中国传统文化中，南风叫薰风。',
                    successDialogues: [
                        '没错！薰风就是南风。',
                        '"迎薰门"就是迎接南风（温暖吉祥之风）的门。',
                        '过去商队从南方回来，都从这南门入城，图个好彩头！'
                    ],
                    reward: 'clue_cityGate_3'
                },
                hints: [
                    '薰风是温暖的风...',
                    '在中国，哪个方向的风是温暖的？',
                    '答案是B，南风叫薰风'
                ]
            }
        ],
        objects: [
            {
                id: 'obj_cityGate_1',
                name: '城门石刻',
                x: 400,
                y: 200,
                width: 40,
                height: 40,
                emoji: '🪨',
                description: '城门石刻上刻着"迎薰"二字，旁边还刻有一只乌龟图案。老人说，平遥城形似乌龟，叫"龟城"，寓意长寿安康。',
                clueId: 'clue_cityGate_1',
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_cityGate_2',
                name: '旧导览牌',
                x: 500,
                y: 300,
                width: 40,
                height: 40,
                emoji: '📋',
                description: '导览牌上写着：平遥古城，始建于西周宣王时期（公元前827-782年），距今已有2800多年历史。明洪武三年（1370年）扩建为砖石城墙。城墙周长6162米，高12米。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_cityGate_3',
                name: '城墙砖铭',
                x: 600,
                y: 250,
                width: 40,
                height: 40,
                emoji: '🧱',
                description: '一块城墙砖上刻着"洪武三年造"。这是明代重修时烧制的砖，每一块都刻着年代和工匠名字，保证质量。这种责任制，体现了晋商的诚信精神。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_cityGate_4',
                name: '掉落的账簿残页',
                x: 700,
                y: 350,
                width: 40,
                height: 40,
                emoji: '📜',
                description: '你捡起了一张残缺的账簿残页，上面隐约可见"日升昌"和"汇通天下"的字样。残页边缘有火烧痕迹，好像经历过一场灾难。',
                clueId: 'clue_cityGate_key',
                isKeyClue: true,
                isDistraction: false
            },
            {
                id: 'obj_cityGate_5',
                name: '灯笼下的旧木牌',
                x: 800,
                y: 200,
                width: 40,
                height: 40,
                emoji: '🪵',
                description: '一盏红灯笼下挂着一块旧木牌，上面写着："入城先问路，行商重守信"。这是平遥古城的传统，做生意的人首先要学会做人。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            }
        ],
        clues: [
            {
                id: 'clue_cityGate_1',
                name: '城门石刻图案',
                icon: '🪨',
                source: '古城入口',
                description: '城门石刻上有乌龟图案，平遥古城形似乌龟，被称为"龟城"。',
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'clue_cityGate_key',
                name: '残缺账簿第一页',
                icon: '📜',
                source: '古城入口',
                description: '从古城入口捡到的账簿残页，上面隐约可见"日升昌"和"汇通天下"的字样。这是解开整个故事的钥匙。',
                isKeyClue: true,
                isDistraction: false
            },
            {
                id: 'clue_cityGate_2',
                name: '龟城来历',
                icon: '🐢',
                source: '古城入口',
                description: '平遥古城形似乌龟，南门是龟头，北门是龟尾，东西四门是龟的四肢。叫"龟城"，寓意长寿安康、固若金汤。',
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'clue_cityGate_3',
                name: '迎薰门含义',
                icon: '💨',
                source: '古城入口',
                description: '"薰"是温暖的风，南风叫薰风，寓意迎接吉祥。过去商队从南边回来，都从这门进，图个好彩头。',
                isKeyClue: false,
                isDistraction: false
            }
        ],
        distractionClues: [
            {
                id: 'clue_cityGate_distraction',
                name: '游客小吃评价',
                icon: '🍢',
                source: '古城入口',
                description: '一个游客说："平遥最重要的是小吃！"这可以作为生活线索，但不是本关答案。',
                isKeyClue: false,
                isDistraction: true
            }
        ],
        puzzle: {
            type: 'choice',
            question: '🧩 核心谜题：古城入口的第一条记忆线索藏在哪里？\n\n提示：你需要调查"城门石刻""城墙砖铭""旧木牌"三个物品后，才能回答。',
            options: [
                'A. 面馆菜单',
                'B. 城门石刻',
                'C. 马车车轮',
                'D. 茶摊布帘'
            ],
            correctAnswer: 1,
            requiredInvestigation: 3,
            hint: '提示：石碑上刻着城市的故事，你想想哪个物品承载着历史记忆？',
            successText: '没错！城门石刻上不仅有"迎薰"二字，还有乌龟图案。平遥古城形似乌龟，叫"龟城"，寓意长寿安康。你已经找到了第一条记忆线索！'
        },
        fragment: 'cityGate',
        fragmentName: '城门记忆碎片'
    },

    bank: {
        title: '日升昌票号',
        npcs: [
            {
                id: 'npc_bank_1',
                name: '老掌柜',
                avatar: '👲',
                x: 300,
                y: 150,
                width: 32,
                height: 48,
                color: '#2F4F4F',
                dialogues: [
                    '欢迎来到日升昌！我们这里可是"汇通天下"的起点。',
                    '你看这账簿上的"壹、叁、伍"，这是票号的数字密码。晋商聪明啊，用汉字大写防止涂改。',
                    '票号最重要的不是钱财，是信用。没有信用，票号一天也开不下去。',
                    '你想试试解开这个密码吗？记住，答案藏在账簿和算盘里。',
                    '那么，账簿和算盘告诉你的三位数字密码是什么？'
                ],
                puzzle: {
                    question: '🧩 老掌柜的问题：账簿和算盘告诉你的三位数字密码是什么？',
                    answer: '135',
                    hint: '提示：壹=1，叁=3，伍=5。账簿和算盘都在提示你这个答案。',
                    successDialogues: [
                        '正确！你将印章拓片按在账簿残页上，模糊的字迹逐渐显现：',
                        '"道光二十年，日升昌创立，以信义为本，汇通天下。此账簿记录非为商账，乃为守信托付之证。"',
                        '你终于明白了，这本账簿记录的不是普通生意，而是一段关于诚信与托付的故事！'
                    ],
                    reward: 'clue_bank_key'
                },
                hints: [
                    '账簿和算盘之间，好像有什么联系...',
                    '你看算盘上的珠子位置，是不是和账簿上的数字对应？',
                    '壹对应1，叁对应3，伍对应5，密码就是135！'
                ]
            },
            {
                id: 'npc_bank_2',
                name: '账房先生',
                avatar: '🧐',
                x: 450,
                y: 250,
                width: 32,
                height: 48,
                color: '#696969',
                dialogues: [
                    '小伙子，看你看这账簿入神了。',
                    '票号的数字格式有讲究：壹、贰、叁、肆、伍、陆、柒、捌、玖、拾。',
                    '用大写汉字是为了防止有人涂改账目。晋商在细节上，那是相当讲究。',
                    '你看这账簿上圈出来的"壹、叁、伍"，肯定有深意。',
                    '那么，票号为什么要用大写数字记账？'
                ],
                puzzle: {
                    question: '🧩 账房先生的问题：票号为什么要用大写数字（壹贰叁...）记账？\n\nA. 为了好看\ B. 防止涂改账目\ C. 为了显示文化\ D. 为了节省空间',
                    answer: 'B',
                    hint: '提示：想想如果有人偷偷把"一"改成"十"，会造成什么后果？',
                    successDialogues: [
                        '正确！用大写数字就是为了防止涂改账目。',
                        '晋商在细节上的严谨，体现了他们的诚信精神。',
                        '这也是为什么日升昌能做到"汇通天下"的原因之一。'
                    ],
                    reward: 'clue_bank_2'
                },
                hints: [
                    '大写数字更难涂改...',
                    '如果有人把"一"改成"十"，账目就乱了...',
                    '答案是B，防止涂改账目'
                ]
            },
            {
                id: 'npc_bank_3',
                name: '外地商人',
                avatar: '🧳',
                x: 550,
                y: 350,
                width: 32,
                height: 48,
                color: '#4682B4',
                dialogues: [
                    '我是来平遥考察的，听说这里的票号特别厉害。',
                    '汇兑不用运现银，凭一张汇票就能在全国取钱，太神奇了！',
                    '我刚才看到柜台上放着汇票样本，上面写着"凭印为证，见票即付"。',
                    '这"印"就是印章啊，没有印章，汇票就是一张废纸。',
                    '那么，票号汇票兑现最重要的凭证是什么？'
                ],
                puzzle: {
                    question: '🧩 外地商人的问题：票号汇票兑现最重要的凭证是什么？\n\nA. 身份证\ B. 印章\ C. 签名\ D. 密码',
                    answer: 'B',
                    hint: '提示：汇票上写着"凭印为证"，这个"印"就是关键。',
                    successDialogues: [
                        '正确！就是印章。',
                        '"凭印为证，见票即付"——这是票号的基本规则。',
                        '印章代表着信用，没有印章，汇票就是一张废纸。'
                    ],
                    reward: 'clue_bank_3'
                },
                hints: [
                    '汇票上写了什么？',
                    '"凭印为证"，印就是...',
                    '答案是B，印章是兑现凭证'
                ]
            },
            {
                id: 'npc_bank_4',
                name: '小伙计',
                avatar: '🧑💼',
                x: 350,
                y: 450,
                width: 32,
                height: 48,
                color: '#8B4513',
                dialogues: [
                    '客官好！您是要汇兑还是存款？',
                    '我们日升昌的印章可重要了，放在最里面的暗格里。',
                    '掌柜说，印章就是信用，不能随便给人看。',
                    '不过今天掌柜心情好，你可以去看看，就在柜台后面的架子上。',
                    '你知道我们日升昌最重要的是什么吗？'
                ],
                puzzle: {
                    question: '🧩 小伙计的问题：日升昌票号最重要的是什么？\n\nA. 钱财\nB. 信用\nC. 印章\nD. 汇票',
                    answer: 'B',
                    hint: '提示：掌柜说"印章就是信用"，信用才是根本。',
                    successDialogues: [
                        '答对啦！就是我们日升昌的信用！',
                        '掌柜常说："信用为本，汇通天下"。没有信用，票号一天也开不下去。',
                        '这枚印章就是信用的象征，所以才这么重要。'
                    ],
                    reward: 'clue_bank_4'
                },
                hints: [
                    '掌柜说过什么很重要的话...',
                    '印章代表着什么？',
                    '答案是B，信用是票号的根本'
                ]
            }
        ],
        objects: [
            {
                id: 'obj_bank_1',
                name: '旧账簿',
                x: 600,
                y: 200,
                width: 40,
                height: 40,
                emoji: '📒',
                description: '一本泛黄的旧账簿，记录着日升昌票号的汇兑业务。上面有"壹、叁、伍"等数字标记，被朱砂圈了出来。旁边还有一行小字："密码藏于算盘间"。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_bank_2',
                name: '木算盘',
                x: 700,
                y: 300,
                width: 40,
                height: 40,
                emoji: '🧮',
                description: '一把老式木质算盘，珠子已经被磨得光滑。有趣的是，算盘上的珠子有1、3、5三组被特意拨到了靠框的位置。这肯定不是巧合！',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_bank_3',
                name: '票号印章',
                x: 800,
                y: 200,
                width: 40,
                height: 40,
                emoji: '🔖',
                description: '一枚精美的印章，刻着"日升昌记"。这是票号信用的象征。你小心地用纸拓下了一片印文。印章旁边刻着一行小字："信义为本，汇通天下"。',
                clueId: 'clue_bank_key',
                isKeyClue: true,
                isDistraction: false
            },
            {
                id: 'obj_bank_4',
                name: '汇票柜台',
                x: 650,
                y: 400,
                width: 40,
                height: 40,
                emoji: '📝',
                description: '汇票柜台上放着几张汇票样本，上面写着："凭印为证，见票即付"。柜台边缘刻着一行字："诚信为本，童叟无欺"。这是晋商的经营理念。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_bank_5',
                name: '墙上匾额',
                x: 750,
                y: 350,
                width: 40,
                height: 40,
                emoji: '🖼️',
                description: '墙上挂着一块匾额，写着"汇通天下"四个大字。旁边还有一块小匾，写着"财源广进"。老掌柜说，前面那块是真精神，后面那块只是吉祥话。',
                clueId: null,
                isKeyClue: false,
                isDistraction: true  // 干扰线索
            },
            {
                id: 'obj_bank_6',
                name: '钱柜暗格',
                x: 850,
                y: 450,
                width: 40,
                height: 40,
                emoji: '🗃️',
                description: '一个精致的钱柜，侧面有个隐蔽的暗格。暗格上没有锁，而是刻着三个数字：壹、叁、伍。这应该就是密码了！',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            }
        ],
        clues: [
            {
                id: 'clue_bank_1',
                name: '票号数字格式',
                icon: '🔢',
                source: '日升昌票号',
                description: '票号使用汉字大写数字（壹贰叁肆伍...)防止涂改，体现了晋商的严谨。',
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'clue_bank_key',
                name: '票号印章拓片',
                icon: '🔖',
                source: '日升昌票号',
                description: '从票号印章上拓下的印文，刻着"日升昌记"。这是票号信用的象征，也是晋商精神的体现。',
                isKeyClue: true,
                isDistraction: false
            }
        ],
        distractionClues: [
            {
                id: 'clue_bank_distraction',
                name: '财源广进匾额',
                icon: '🖼️',
                source: '日升昌票号',
                description: '墙上挂着"财源广进"的装饰匾额，但老掌柜说这只是吉祥话，不是票号的核心精神。',
                isKeyClue: false,
                isDistraction: true
            }
        ],
        puzzle: {
            type: 'password',
            question: '🧩 核心谜题：票号暗格密码\n\n账簿上写着"壹、叁、伍"，算盘上1、3、5三组珠位被拨动。\n\n请按照提示输入三位数字密码：',
            answer: '135',
            requiredClues: ['clue_cityGate_key'],  // 需要前置线索
            requiredInvestigation: 3,
            hint: '提示：壹=1，叁=3，伍=5。账簿和算盘都在提示你这个答案。',
            failText: '你还没有找到足够的账簿线索，直接猜密码很难成功。先去调查一下账簿、算盘和印章吧。',
            successText: '正确！你将印章拓片按在账簿残页上，模糊的字迹逐渐显现：\n\n"道光二十年，日升昌创立，以信义为本，汇通天下。此账簿记录非为商账，乃为守信托付之证。"\n\n你终于明白了，这本账簿记录的不是普通生意，而是一段关于诚信与托付的故事！'
        },
        fragment: 'bank',
        fragmentName: '票号账簿碎片'
    },

    escortAgency: {
        title: '镖局旧址',
        npcs: [
            {
                id: 'npc_escort_1',
                name: '镖师后人',
                avatar: '🤠',
                x: 250,
                y: 150,
                width: 32,
                height: 48,
                color: '#654321',
                dialogues: [
                    '嘿！小伙子，你对镖局感兴趣？我们镖局走南闯北，最讲究的就是一个"信"字。',
                    '你看这张商路地图，从平遥出发，要经过哪些地方才能到达张家口？',
                    '选对路线，才能顺利完成任务！晋商的生意，就是这么一步步走出来的。',
                    '记住，镖局护的不只是货物，更是信义。没有信用，谁敢把贵重物品交给你？',
                    '那么，从平遥出发，正确的商路路线是哪一选项？'
                ],
                puzzle: {
                    question: '🧩 镖师后人的问题：从平遥出发，正确的商路路线是？\n\nA. 平遥 → 大同 → 张家口\nB. 平遥 → 太谷 → 祁县 → 张家口\nC. 平遥 → 太原 → 张家口',
                    answer: 'B',
                    hint: '提示：太谷是药材集散地，祁县是茶商重镇，商路必经之地。',
                    successDialogues: [
                        '正确！路线是：平遥 → 太谷 → 祁县 → 张家口。',
                        '太谷是药材集散地，祁县是茶商最多之地。晋商的生意，就是这么一步步走出来的。',
                        '你找到了商路地图残片，这上面标注着晋商走南闯北的路线。'
                    ],
                    reward: 'clue_escort_key'
                },
                hints: [
                    '商路不是随便走的，要经过重要的晋商城市...',
                    '太谷和祁县都是晋商重镇，这条路线肯定要经过。',
                    '正确路线是：平遥 → 太谷 → 祁县 → 张家口'
                ]
            },
            {
                id: 'npc_escort_2',
                name: '马夫',
                avatar: '🧑🌾',
                x: 400,
                y: 250,
                width: 32,
                height: 48,
                color: '#8B4513',
                dialogues: [
                    '我赶了一辈子马车，跑遍了这条商路。',
                    '从平遥出发，先到太谷，那里是药材集散地。',
                    '然后去祁县，那里的茶商最多。再往北就到张家口了，那是通往蒙古的关口。',
                    '路上要经过很多驿站，每个驿站都有故事。',
                    '那么，从平遥出发，第一个经过的晋商重镇是哪里？'
                ],
                puzzle: {
                    question: '🧩 马夫的问题：从平遥出发，第一个经过的晋商重镇是？\n\nA. 大同\ B. 太谷\ C. 太原\ D. 忻州',
                    answer: 'B',
                    hint: '提示：马夫说"先到太谷，那里是药材集散地"。',
                    successDialogues: [
                        '没错！就是太谷。',
                        '太谷是药材集散地，从平遥出发先到太谷，再到祁县，最后到张家口。',
                        '这条商路，晋商走了几百年！'
                    ],
                    reward: 'clue_escort_2'
                },
                hints: [
                    '马夫说先到哪里？',
                    '太谷是药材集散地...',
                    '答案是B，太谷'
                ]
            },
            {
                id: 'npc_escort_3',
                name: '武器架旁的老人',
                avatar: '🧓',
                x: 500,
                y: 350,
                width: 32,
                height: 48,
                color: '#2F4F4F',
                dialogues: [
                    '年轻人，你以为镖局靠的是武力？错了！',
                    '镖局最重要的是信用和口碑。镖师武功高强不假，但真正让人信赖的，是"言必信，行必果"的品格。',
                    '你看那镖旗上的字："护的是货，更是信"。这才是镖局的灵魂。',
                    '没有信用，再高的武功也保不住镖。',
                    '那么，镖局最重要的是什么？'
                ],
                puzzle: {
                    question: '🧩 武器架旁的老人的问题：镖局最重要的是什么？\n\nA. 武力\ B. 信用\ C. 速度\ D. 价格',
                    answer: 'B',
                    hint: '提示：镖旗上写着什么？"护的是货，更是..."',
                    successDialogues: [
                        '正确！镖局最重要的是信用。',
                        '"护的是货，更是信"——这才是镖局的灵魂。',
                        '没有信用，再高的武功也保不住镖。晋商精神，重在信义！'
                    ],
                    reward: 'clue_escort_3'
                },
                hints: [
                    '镖旗上写了什么？',
                    '"护的是货，更是信"，信就是...',
                    '答案是B，信用是镖局的根本'
                ]
            },
            {
                id: 'npc_escort_4',
                name: '路过商贩',
                avatar: '🧔',
                x: 600,
                y: 450,
                width: 32,
                height: 48,
                color: '#A0522D',
                dialogues: [
                    '老板，来壶茶！跑了一天了。',
                    '我跟你说，去张家口应该先往北到大同，再去张家口。',
                    '我上次就是这么走的，路好走，就是远了点。',
                    '不过现在有了火车，谁还走镖啊...',
                    '你觉得我说的路线对吗？'
                ],
                puzzle: {
                    question: '🧩 路过商贩的问题：他说路线对吗？\n\nA. 对，先到大同\nB. 不对，应该先到太谷\nC. 都可以\nD. 不知道',
                    answer: 'B',
                    hint: '提示：看看商路地图和驿站木牌，它们标注的路线才是对的。',
                    successDialogues: [
                        '嘿，你还挺聪明！我那是个人经验，不是标准商路。',
                        '标准商路是：平遥 → 太谷 → 祁县 → 张家口。',
                        '太谷是药材集散地，祁县是茶商重镇，商路必经！'
                    ],
                    reward: 'clue_escort_4'
                },
                hints: [
                    '商路地图标注的路线...',
                    '太谷和祁县都是晋商重镇...',
                    '答案是B，他说的不对'
                ],
                isDistraction: true
            }
        ],
        objects: [
            {
                id: 'obj_escort_1',
                name: '商路地图',
                x: 700,
                y: 200,
                width: 40,
                height: 40,
                emoji: '🗺️',
                description: '一张泛黄的商路地图，标注着从平遥出发，途经太谷、祁县，到达张家口的路线。地图上用朱砂标记了每个驿站的位置。旁边备注："先东行，再北上"。',
                clueId: 'clue_escort_key',
                isKeyClue: true,
                isDistraction: false
            },
            {
                id: 'obj_escort_2',
                name: '镖旗',
                x: 800,
                y: 300,
                width: 40,
                height: 40,
                emoji: '🚩',
                description: '一面褪色的镖旗，上面绣着"同兴公"三个字。这是镖局的标志，也是身份的象征。镖旗背面写着一行小字："护的是货，更是信"。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_escort_3',
                name: '旧马车',
                x: 900,
                y: 400,
                width: 40,
                height: 40,
                emoji: '🐴',
                description: '一辆老式马车，曾经载着镖师和货物走南闯北。车轮上的痕迹诉说着往日的艰辛。马车货牌上写着："晋货北上，信义为伴"。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_escort_4',
                name: '驿站木牌',
                x: 750,
                y: 500,
                width: 40,
                height: 40,
                emoji: '🪧',
                description: '一块驿站木牌，上面写着各驿站之间的距离。最关键的是这句话："从平遥出发，先东行到太谷，再北上经祁县，最后到达张家口。"',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_escort_5',
                name: '马厩草料袋',
                x: 850,
                y: 550,
                width: 40,
                height: 40,
                emoji: '👜',
                description: '马厩里挂着草料袋，上面绣着"同兴公镖局"字样。草料袋里还放着一张纸条："大同路线已废，现走太谷-祁县线"。这说明商路是随着时代变化的。',
                clueId: null,
                isKeyClue: false,
                isDistraction: true  // 干扰线索，暗示错误的路线
            }
        ],
        clues: [
            {
                id: 'clue_escort_1',
                name: '镖局精神',
                icon: '⚔️',
                source: '镖局旧址',
                description: '镖局不仅靠武力，更靠信用。镖旗上写着"护的是货，更是信"。',
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'clue_escort_key',
                name: '商路地图残片',
                icon: '🗺️',
                source: '镖局旧址',
                description: '一张标注着平遥到张家口商路的地图残片。正确路线是：平遥 → 太谷 → 祁县 → 张家口。晋商就是这样走南闯北，将生意做到了全国。',
                isKeyClue: true,
                isDistraction: false
            }
        ],
        distractionClues: [
            {
                id: 'clue_escort_distraction',
                name: '错误商路传闻',
                icon: '🤔',
                source: '镖局旧址',
                description: '路过商贩说应该先去大同，但地图上标注的路线是经太谷、祁县到张家口。商贩的路线可能是个人经验，不是标准商路。',
                isKeyClue: false,
                isDistraction: true
            }
        ],
        puzzle: {
            type: 'choice',
            question: '🧩 核心谜题：选择正确商路路线\n\n镖师后人要你选择从平遥到张家口的正确商路。\n\n提示：你需要调查"商路地图""驿站木牌""镖旗"三个物品后，才能回答。',
            options: [
                'A. 平遥 → 太谷 → 祁县 → 张家口',
                'B. 平遥 → 大同 → 太原 → 张家口',
                'C. 平遥 → 洛阳 → 西安 → 张家口',
                'D. 平遥 → 忻州 → 五台山 → 张家口'
            ],
            correctAnswer: 0,
            requiredClues: ['clue_bank_key'],  // 需要前置线索
            requiredInvestigation: 3,
            hint: '提示：太谷和祁县都是晋商重镇，而且地图和驿站木牌都指向这条路线。',
            successText: '没错！这就是晋商走西口的重要商路。\n\n有了商路地图，晋商的生意才能做到天下。镖局不仅保护货物安全，更传递了晋商的信用与精神。\n\n你现在已经收集了两条关键线索，继续前进吧！'
        },
        fragment: 'escortAgency',
        fragmentName: '商路信物碎片'
    },

    noodleShop: {
        title: '老街面馆',
        npcs: [
            {
                id: 'npc_noodle_1',
                name: '面馆老板娘',
                avatar: '👩🍳',
                x: 300,
                y: 400,
                width: 32,
                height: 48,
                color: '#A0522D',
                dialogues: [
                    '来碗牛肉面不？咱平遥的牛肉面可是有讲究的！',
                    '面条要手工擀，牛肉要平遥本地黄牛，汤要用牛骨熬三个时辰。',
                    '你看这张老照片，这就是几十年前的平遥老街，烟火气满满啊...',
                    '商队回来时，总爱坐那张靠窗的桌子，点一碗刀削面，聊一路的故事。',
                    '那么，商队归来最相关的物件是什么？'
                ],
                puzzle: {
                    question: '🧩 老板娘的问题：商队归来最相关的物件是什么？\n\nA. 刀削面\nB. 茶壶\nC. 红灯笼\nD. 布鞋',
                    answer: 'A',
                    hint: '提示：老照片背面写了什么？商队归来，必点什么面？',
                    successDialogues: [
                        '没错！就是刀削面。',
                        '老照片背面写着"商队归来，必点刀削面"。面食不仅是食物，更是平遥人的生活记忆和文化传承。',
                        '你找到了面馆老照片，这上面记录着平遥的市井烟火气。'
                    ],
                    reward: 'clue_noodle_key'
                },
                hints: [
                    '面食不仅是食物，更是平遥人的生活记忆...',
                    '老照片里有什么线索？商队最爱吃什么面？',
                    '刀削面是平遥面食的代表，也是商队归来必点的'
                ]
            },
            {
                id: 'npc_noodle_2',
                name: '老食客',
                avatar: '👴',
                x: 400,
                y: 500,
                width: 32,
                height: 48,
                color: '#8B4513',
                dialogues: [
                    '小伙子，你也来吃面啊？我可是这里的常客了。',
                    '几十年前，晋商商队回来时，总爱来这里吃面。',
                    '他们最爱坐靠窗第三张桌，点一碗刀削面，聊一路的见闻。',
                    '你看那张桌子，桌面上还刻着"守信者，必归"几个字呢。',
                    '那么，商队最爱坐哪张桌子？'
                ],
                puzzle: {
                    question: '🧩 老食客的问题：商队归来最爱坐哪张桌子？\n\nA. 门口第一张桌\nB. 靠窗第三张桌\nC. 角落那张桌\nD. 柜台旁边那张',
                    answer: 'B',
                    hint: '提示：老食客说"他们最爱坐靠窗第三张桌"，桌面上还刻着字。',
                    successDialogues: [
                        '没错！就是靠窗第三张桌。',
                        '桌面上刻着"守信者，必归"五个字，这是晋商的信义精神。',
                        '商队回来，坐在这张桌上吃面，聊一路的见闻，多惬意！'
                    ],
                    reward: 'clue_noodle_2'
                },
                hints: [
                    '老食客说他们最爱坐哪里？',
                    '靠窗第几张桌？桌面上刻着什么字？',
                    '答案是B，靠窗第三张桌'
                ]
            },
            {
                id: 'npc_noodle_3',
                name: '送面少年',
                avatar: '🧑🍳',
                x: 500,
                y: 450,
                width: 32,
                height: 48,
                color: '#4682B4',
                dialogues: [
                    '客官，你的面好嘞！小心烫！',
                    '我是老板娘的孙子，放假来帮忙。',
                    '你看墙上那张老照片没？那是我爷爷年轻时候拍的。',
                    '他说那时候商队回来，这店里坐得满满的，全是故事。',
                    '那么，老照片记录了什么场景？'
                ],
                puzzle: {
                    question: '🧩 送面少年的问题：老照片记录了什么场景？\n\nA. 商队出发\nB. 商队归来吃面\nC. 票号开业\nD. 镖局训练',
                    answer: 'B',
                    hint: '提示：老照片背面写了什么？商队什么时候会来面馆？',
                    successDialogues: [
                        '答对啦！就是商队归来吃面的场景。',
                        '老照片背面写着"商队归来，必点刀削面"。',
                        '面食不仅是食物，更是平遥人的生活记忆和文化传承。'
                    ],
                    reward: 'clue_noodle_3'
                },
                hints: [
                    '老照片背面写了什么？',
                    '商队什么时候会来面馆？',
                    '答案是B，商队归来吃面'
                ]
            },
            {
                id: 'npc_noodle_4',
                name: '外地游客',
                avatar: '🧳',
                x: 600,
                y: 550,
                width: 32,
                height: 48,
                color: '#696969',
                dialogues: [
                    '这面真好吃！不过我觉得面食就只是食物而已。',
                    '我来平，主要是看古城，吃小吃是顺带的。',
                    '不过老板娘说面食里有故事，我不太懂。',
                    '我觉得平最出名的应该是票号和镖局，面食只是配角。',
                    '你觉得面食在平遥文化里重要吗？'
                ],
                puzzle: {
                    question: '🧩 外地游客的问题：面食在平遥文化中的地位是？\n\nA. 只是食物\nB. 文化传承和记忆\nC. 不重要的配角\nD. 只有游客才吃',
                    answer: 'B',
                    hint: '提示：老照片背面写了什么？商队归来必点什么？',
                    successDialogues: [
                        '哎，好像你说得对...',
                        '老照片背面写着"商队归来，必点刀削面"。',
                        '面食不仅是食物，更是平遥人的生活记忆和文化传承！'
                    ],
                    reward: 'clue_noodle_4'
                },
                hints: [
                    '老照片背面写了什么？',
                    '面食和记忆有什么关系？',
                    '答案是B，面食是文化传承'
                ],
                isDistraction: true
            }
        ],
        objects: [
            {
                id: 'obj_noodle_1',
                name: '老照片',
                x: 350,
                y: 350,
                width: 40,
                height: 40,
                emoji: '📸',
                description: '一张黑白老照片，照片里是上世纪平遥老街的面馆，人们坐在门口吃面，笑容朴实。照片背面写着一行字："商队归来，必点刀削面"。',
                clueId: 'clue_noodle_key',
                isKeyClue: true,
                isDistraction: false
            },
            {
                id: 'obj_noodle_2',
                name: '面食菜单',
                x: 450,
                y: 300,
                width: 40,
                height: 40,
                emoji: '📝',
                description: '手写的菜单挂在墙上：平遥牛肉面、刀削面、拨鱼子、猫耳朵、莜面栲栳栳...每一种都是平遥的味道。菜单上"刀削面"三个字被红笔圈了出来。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_noodle_3',
                name: '木桌刻痕',
                x: 550,
                y: 350,
                width: 40,
                height: 40,
                emoji: '🪵',
                description: '靠窗第三张木桌，桌面上刻着"守信者，必归"五个字。老板娘说，这是当年一个镖师刻下的。每次走镖回来，他都要坐在这张桌子吃面。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_noodle_4',
                name: '面案和擀面杖',
                x: 650,
                y: 400,
                width: 40,
                height: 40,
                emoji: '🍜',
                description: '面馆门口的面案上，一根粗大的擀面杖静静躺着。老板娘说，这根擀面杖传了三代人，擀出的面条筋道爽滑。面案边缘刻着"食为天，诚为本"。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_noodle_5',
                name: '留言木牌',
                x: 750,
                y: 450,
                width: 40,
                height: 40,
                emoji: '🪵',
                description: '一块老式木牌，上面刻着："一碗面，一份情，平遥的味道忘不了。"这是老板娘为女儿刻的，希望她无论走到哪里，都记得家乡的味道。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_noodle_6',
                name: '收音机',
                x: 850,
                y: 500,
                width: 40,
                height: 40,
                emoji: '📻',
                description: '柜台上放着一台老式收音机，还在播放晋剧。老板娘说，开着收音机做饭才有感觉。收音机旁边放着一本泛黄的相册，里面全是老街的回忆。',
                clueId: null,
                isKeyClue: false,
                isDistraction: true  // 干扰线索
            }
        ],
        clues: [
            {
                id: 'clue_noodle_1',
                name: '面食文化',
                icon: '🍜',
                source: '老街面馆',
                description: '平遥面食不仅是食物，更是文化传承。刀削面、拨鱼子等都是平遥的味道。',
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'clue_noodle_key',
                name: '面馆老照片',
                icon: '📸',
                source: '老街面馆',
                description: '一张上世纪平遥老街面馆的老照片。照片背面写着"商队归来，必点刀削面"。市井烟火中，藏着最真实的文化记忆。',
                isKeyClue: true,
                isDistraction: false
            }
        ],
        distractionClues: [
            {
                id: 'clue_noodle_distraction',
                name: '外地游客的看法',
                icon: '🤔',
                source: '老街面馆',
                description: '外地游客认为"面食只是食物"，但老板娘暗示它也是地方记忆。游客的看法过于表面，没有理解面食的文化内涵。',
                isKeyClue: false,
                isDistraction: true
            }
        ],
        puzzle: {
            type: 'choice',
            question: '🧩 核心谜题：找出老街记忆中与商队归来最相关的物件\n\n老食客说商队回来时总坐靠窗第三张桌，点一碗刀削面。\n\n提示：你需要调查"老照片""菜单""木桌刻痕"三个物品后，才能回答。',
            options: [
                'A. 刀削面',
                'B. 茶壶',
                'C. 红灯笼',
                'D. 布鞋'
            ],
            correctAnswer: 0,
            requiredClues: ['clue_escort_key'],  // 需要前置线索
            requiredInvestigation: 3,
            hint: '提示：商队归来必点什么面？老照片背面写了什么？',
            successText: '没错！就是刀削面。\n\n老照片背面写着"商队归来，必点刀削面"。面食不仅是食物，更是平遥人的生活记忆和文化传承。\n\n你现在已经深刻体会到了平遥的市井烟火气，继续前往最后一个场景吧！'
        },
        fragment: 'noodleShop',
        fragmentName: '老街烟火碎片'
    },

    courtyard: {
        title: '古宅院落',
        npcs: [
            {
                id: 'npc_courtyard_1',
                name: '古宅修复师',
                avatar: '🧓',
                x: 300,
                y: 400,
                width: 32,
                height: 48,
                color: '#6B4226',
                dialogues: [
                    '这就是我们家的老宅子了，已经传了六代。晋商的院子都有讲究。',
                    '你看这砖雕、木雕，每一处都有寓意。砖雕"福禄寿喜"，木雕"梅兰竹菊"，都是对美好生活的向往。',
                    '我在修复这院子时，在旧书桌的暗格里发现了一封信...',
                    '那封信没有寄出，信纸已经泛黄。但信中的故事，解释了所有的事情。',
                    '那么，这本账簿真正记录的是什么？'
                ],
                puzzle: {
                    question: '🧩 修复师的问题：这本账簿真正记录的是？\n\nA. 一笔普通买卖\nB. 一场家族争产\nC. 一段守信托付的古城记忆\nD. 一张藏宝图',
                    answer: 'C',
                    hint: '提示：想想你收集的所有线索，它们共同指向什么主题？信用？商路？托付？还是记忆？',
                    successDialogues: [
                        '正确！\n\n你成功打开了暗格，里面放着一本完整的账簿和那封未寄出的信。\n\n信中写着：\n\n"道光二十年，我随商队走南闯北，创立日升昌票号，以信义为本。此账簿非为记录财货，乃为铭记托付。每一位客商的托付，都是一份信任，不可辜负。\n\n如今归来，愿将此故事传于后人，让平遥精神永存。"\n\n你终于明白了整件事情的真相！'
                    ],
                    reward: 'clue_courtyard_key'
                },
                hints: [
                    '家书的内容，和前面收集的线索有关联...',
                    '账簿、印章、地图、老照片，这些线索都指向同一个故事。',
                    '暗格的密码，应该和"信用、商路、托付、记忆"有关'
                ]
            },
            {
                id: 'npc_courtyard_2',
                name: '老邻居',
                avatar: '👵',
                x: 450,
                y: 500,
                width: 32,
                height: 48,
                color: '#8B4513',
                dialogues: [
                    '小伙子，你是这家的小辈吧？好久没回来了。',
                    '你爷爷年轻时可是个传奇人物，走南闯北做买卖，信用特别好。',
                    '他每次回来，都要在院子里坐半天，看看砖雕，摸摸木雕。',
                    '他说这些老物件里有祖辈的智慧，不能丢。',
                    '那么，晋商大院最看重什么？'
                ],
                puzzle: {
                    question: '🧩 老邻居的问题：晋商大院最看重什么？\n\nA. 钱财\nB. 信用和家风\nC. 地位\nD. 名声',
                    answer: 'B',
                    hint: '提示：爷爷"信用特别好"，老物件里有"祖辈的智慧"。',
                    successDialogues: [
                        '没错！晋商大院最看重的是信用和家风。',
                        '"信用特别好"——这是晋商最宝贵的财富。',
                        '砖雕木雕不仅是装饰，更是家风的传承。'
                    ],
                    reward: 'clue_courtyard_2'
                },
                hints: [
                    '爷爷有什么特点？',
                    '老物件里有什么？',
                    '答案是B，信用和家风是晋商的根本'
                ]
            },
            {
                id: 'npc_courtyard_3',
                name: '年轻志愿者',
                avatar: '🧑🔬',
                x: 550,
                y: 450,
                width: 32,
                height: 48,
                color: '#4169E1',
                dialogues: [
                    '你好！我是来帮忙修复古宅的志愿者。',
                    '我在整理旧物时，发现暗格上有几个数字刻度，好像是密码锁。',
                    '我猜密码可能是修建年份，但不确定。你觉得呢？',
                    '不过修建年份是明朝的，密码只有三位，应该不是年份...',
                    '那么，暗格密码是修建年份吗？'
                ],
                puzzle: {
                    question: '🧩 年轻志愿者的问题：暗格密码是修建年份吗？\n\nA. 是\nB. 不是\nC. 可能是\nD. 不知道',
                    answer: 'B',
                    hint: '提示：志愿者自己说"应该不是年份..."，看看暗格机关上的刻字。',
                    successDialogues: [
                        '嘿，你还挺聪明！我也觉得不是修建年份。',
                        '暗格机关上刻着："信用、商路、托付、记忆"。',
                        '密码应该和这些关键词有关，不是简单的数字年份！'
                    ],
                    reward: 'clue_courtyard_3'
                },
                hints: [
                    '志愿者自己都不确定...',
                    '暗格机关上刻了什么字？',
                    '答案是B，不是修建年份'
                ],
                isDistraction: true
            },
            {
                id: 'npc_courtyard_4',
                name: '家族后人',
                avatar: '👨💼',
                x: 650,
                y: 350,
                width: 32,
                height: 48,
                color: '#2F4F4F',
                dialogues: [
                    '你终于来了！我是你堂哥，负责看守这宅子。',
                    '爷爷留下的信里说，账簿不是普通商账，而是一段守信托付的故事。',
                    '要打开暗格，需要把前面收集的线索联系起来。',
                    '记住：信用为本、商路为证、市井为忆、家族为根。这四个关键词就是密码。',
                    '那么，打开暗格需要哪四个关键词？'
                ],
                puzzle: {
                    question: '🧩 家族后人的问题：打开暗格需要哪四个关键词？\n\n提示：对话中已经告诉你了，仔细看第四句对话。',
                    answer: '信用为本、商路为证、市井为忆、家族为根',
                    hint: '提示：信用为本、商路为证、市井为忆、家族为根。这四个就是关键词。',
                    successDialogues: [
                        '完全正确！',
                        '信用为本——日升昌的精神。',
                        '商路为证——镖局走过的路。',
                        '市井为忆——面馆里的烟火气。',
                        '家族为根——古宅传承的家风。',
                        '这就是整本账簿记录的故事！'
                    ],
                    reward: 'clue_courtyard_key'
                },
                hints: [
                    '对话里说了四个关键词...',
                    '信用为本、商路为证...',
                    '答案是：信用为本、商路为证、市井为忆、家族为根'
                ]
            }
        ],
        objects: [
            {
                id: 'obj_courtyard_1',
                name: '旧书桌',
                x: 700,
                y: 400,
                width: 40,
                height: 40,
                emoji: '🪑',
                description: '一张老式书桌椅，做工精致。抽屉上刻着精美的花纹。你试着拉开抽屉，发现最里面的暗格上有数字刻度：壹、贰、叁、肆。这应该就是密码锁了！',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_courtyard_2',
                name: '家书匣子',
                x: 800,
                y: 500,
                width: 40,
                height: 40,
                emoji: '📦',
                description: '一个精致的木匣子，里面放着几封家书。其中一封没有寄出，信纸已经泛黄。信中讲述着平遥古城百年来的商贾传奇与人间烟火，以及一封未完成的托付...',
                clueId: 'clue_courtyard_key',
                isKeyClue: true,
                isDistraction: false
            },
            {
                id: 'obj_courtyard_3',
                name: '院落砖雕',
                x: 750,
                y: 600,
                width: 40,
                height: 40,
                emoji: '🧱',
                description: '院墙上的砖雕精美绝伦，雕刻着"福禄寿喜"的图案。这是晋商家族对美好生活的向往。砖雕角落还有一方小印，刻着"日升昌记"！这和票号印章上的印文一模一样。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_courtyard_4',
                name: '窗棂纹样',
                x: 850,
                y: 550,
                width: 40,
                height: 40,
                emoji: '🪟',
                description: '古宅的窗棂上雕刻着精美纹样，对应四个方向：东、南、西、北。修复师说，这象征着晋商走遍四方，但心始终向着家乡。窗棂图案和票号印章的边框很像。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_courtyard_5',
                name: '祖训木牌',
                x: 900,
                y: 450,
                width: 40,
                height: 40,
                emoji: '🪵',
                description: '堂屋正中挂着一块祖训木牌，上面写着："信义传家，耕读为本"。这是这个家族代代相传的家训。木牌背面还有一行小字："账非为财，记的是托付"。',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'obj_courtyard_6',
                name: '暗格机关',
                x: 950,
                y: 350,
                width: 40,
                height: 40,
                emoji: '🔒',
                description: '旧书桌侧面有个隐蔽的暗格机关，上面有四个数字刻度：壹、贰、叁、肆。机关上还刻着一行字："信用、商路、托付、记忆"。这应该就是打开暗格的密码提示！',
                clueId: null,
                isKeyClue: false,
                isDistraction: false
            }
        ],
        clues: [
            {
                id: 'clue_courtyard_1',
                name: '晋商大院文化',
                icon: '🏘️',
                source: '古宅院落',
                description: '晋商大院讲究"四合院"布局，砖雕木雕精美，体现家族文化和审美追求。',
                isKeyClue: false,
                isDistraction: false
            },
            {
                id: 'clue_courtyard_key',
                name: '家书残页',
                icon: '📦',
                source: '古宅院落',
                description: '从家书匣子里发现的一封未寄出的信。信中讲述着平遥古城百年来的商贾传奇与人间烟火，以及一段关于守信与托付的记录。',
                isKeyClue: true,
                isDistraction: false
            }
        ],
        distractionClues: [
            {
                id: 'clue_courtyard_distraction',
                name: '修建年份误导',
                icon: '🤔',
                source: '古宅院落',
                description: '年轻志愿者误以为暗格密码是修建年份，但实际不是。密码应该和前面收集的关键线索有关。',
                isKeyClue: false,
                isDistraction: true
            }
        ],
        puzzle: {
            type: 'choice',
            question: '🧩 最终谜题：打开旧宅暗格\n\n暗格机关上刻着："信用、商路、托付、记忆"。\n\n这本账簿真正记录的是什么？',
            options: [
                'A. 一笔普通买卖',
                'B. 一场家族争产',
                'C. 一段守信托付的古城记忆',
                'D. 一张藏宝图'
            ],
            correctAnswer: 2,
            requiredClues: ['clue_cityGate_key', 'clue_bank_key', 'clue_escort_key', 'clue_noodle_key'],
            requiredInvestigation: 4,
            hint: '提示：想想你收集的所有线索，它们共同指向什么主题？信用？商路？托付？还是记忆？',
            successText: '正确！\n\n你成功打开了暗格，里面放着一本完整的账簿和那封未寄出的信。\n\n信中写着：\n\n"道光二十年，我随商队走南闯北，创立日升昌票号，以信义为本。此账簿非为记录财货，乃为铭记托付。每一位客商的托付，都是一份信任，不可辜负。\n\n如今归来，愿将此故事传于后人，让平遥精神永存。"\n\n你终于明白了整件事情的真相！'
        },
        fragment: 'courtyard',
        fragmentName: '家书记忆碎片'
    }
};

// ========================================
// 最终推理配置
// ========================================
const FINAL_PUZZLE = {
    title: '最终推理：拼合古城记忆',
    description: '请从下方线索中选择4个关键线索，拼出真相：',
    correctClues: ['clue_cityGate_key', 'clue_bank_key', 'clue_escort_key', 'clue_courtyard_key'],
    successText: '恭喜！你成功拼合了古城记忆。\n\n【真相】\n\n这本账簿记录的并不只是一笔商业往来，而是一段晋商远行中守信互助的故事。\n\n你的祖父是日升昌票号的创立者之一，他走南闯北，以信义为本，创立了"汇通天下"的票号传奇。\n\n账簿和家书，记录的是晋商的信用精神、商路传奇、市井烟火和家族传承。\n\n多年后，你通过Citywalk探索重新发现这段古城记忆，并决定将它做成数字文化导览，让更多年轻人重新认识家乡。\n\n这就是《晋行谜城》的真正意义！',
    allClues: [
        { id: 'clue_cityGate_key', name: '残缺账簿第一页', icon: '📜' },
        { id: 'clue_bank_key', name: '票号印章拓片', icon: '🔖' },
        { id: 'clue_escort_key', name: '商路地图残片', icon: '🗺️' },
        { id: 'clue_noodle_key', name: '面馆老照片', icon: '📸' },
        { id: 'clue_courtyard_key', name: '家书残页', icon: '📦' },
        // 干扰线索
        { id: 'clue_cityGate_distraction', name: '游客小吃评价', icon: '🍢' },
        { id: 'clue_bank_distraction', name: '财源广进匾额', icon: '🖼️' },
        { id: 'clue_escort_distraction', name: '错误商路传闻', icon: '🤔' },
        { id: 'clue_noodle_distraction', name: '外地游客的看法', icon: '🤔' },
        { id: 'clue_courtyard_distraction', name: '修建年份误导', icon: '🤔' }
    ]
};

// ========================================
// 分层提示系统配置
// ========================================
const HINTS = {
    cityGate: [
        {
            level: 1,
            text: '轻提示：这座古城的历史很悠久，想想它始建于哪个朝代？城墙上的砖铭可能有帮助。'
        },
        {
            level: 2,
            text: '中提示：平遥城墙始建于西周时期，距今已有2800多年。"西周"就是你要找的答案。'
        },
        {
            level: 3,
            text: '强提示：答案就是"西周"。城门石刻、旧导览牌、城墙砖铭都在暗示这个答案。'
        }
    ],
    bank: [
        {
            level: 1,
            text: '轻提示：账簿和算盘之间好像有联系，去看看它们都记录了什么数字？'
        },
        {
            level: 2,
            text: '中提示：账簿里写着"壹、叁、伍"，算盘上1、3、5三组珠位被拨动。这两个线索指向同一个密码。'
        },
        {
            level: 3,
            text: '强提示：密码就是"135"。壹=1，叁=3，伍=5。把这三个数字连起来就是答案。'
        }
    ],
    escortAgency: [
        {
            level: 1,
            text: '轻提示：商路地图和驿站木牌都标注了路线，去看看它们指向哪里？'
        },
        {
            level: 2,
            text: '中提示：正确路线经过太谷和祁县，这两个都是晋商重镇。路线是平遥 → 太谷 → 祁县 → 张家口。'
        },
        {
            level: 3,
            text: '强提示：答案是A。平遥 → 太谷 → 祁县 → 张家口。商贩说的大同路线是错误的。'
        }
    ],
    noodleShop: [
        {
            level: 1,
            text: '轻提示：老照片背面写了什么？商队归来最爱吃什么？'
        },
        {
            level: 2,
            text: '中提示：老照片背面写着"商队归来，必点刀削面"。刀削面是平遥面食的代表。'
        },
        {
            level: 3,
            text: '强提示：答案是A，刀削面。面食不仅是食物，更是平遥的文化记忆。'
        }
    ],
    courtyard: [
        {
            level: 1,
            text: '轻提示：家书匣子里的信说了什么？前面收集的线索都指向什么主题？'
        },
        {
            level: 2,
            text: '中提示：账簿记录的是"守信托付"的故事，不是普通商账。信用、商路、托付、记忆，这四个关键词就是答案。'
        },
        {
            level: 3,
            text: '强提示：答案是C。这段账簿记录的是一段守信托付的古城记忆。'
        }
    ]
};

// ========================================
// 任务系统配置
// ========================================
const TASKS = [
    {
        id: 'task1',
        title: '任务1：回到古城',
        description: '在古城入口与老讲解员、游客小孩、守门老人对话，调查至少3个物品，获得"残缺账簿第一页"。',
        targetScene: 'cityGate',
        requiredClues: [],
        requiredInvestigation: 3,
        rewardClue: 'clue_cityGate_key',
        isCompleted: false,
        isActive: true
    },
    {
        id: 'task2',
        title: '任务2：寻找票号线索',
        description: '前往日升昌票号，与老掌柜、账房先生、外地商人、小伙计对话，调查至少3个物品，解开票号密码。',
        targetScene: 'bank',
        requiredClues: ['clue_cityGate_key'],
        requiredInvestigation: 3,
        rewardClue: 'clue_bank_key',
        isCompleted: false,
        isActive: false
    },
    {
        id: 'task3',
        title: '任务3：追踪商路',
        description: '前往镖局旧址，与镖师后人、马夫、武器架旁的老人对话，调查至少3个物品，选择正确商路路线。',
        targetScene: 'escortAgency',
        requiredClues: ['clue_bank_key'],
        requiredInvestigation: 3,
        rewardClue: 'clue_escort_key',
        isCompleted: false,
        isActive: false
    },
    {
        id: 'task4',
        title: '任务4：寻找市井证言',
        description: '前往老街面馆，与老板娘、老食客、送面少年对话，调查至少3个物品，找出商队归来最相关的物件。',
        targetScene: 'noodleShop',
        requiredClues: ['clue_escort_key'],
        requiredInvestigation: 3,
        rewardClue: 'clue_noodle_key',
        isCompleted: false,
        isActive: false
    },
    {
        id: 'task5',
        title: '任务5：打开旧宅暗格',
        description: '前往古宅院落，与修复师、老邻居、年轻志愿者对话，调查至少4个物品，解开暗格谜题。',
        targetScene: 'courtyard',
        requiredClues: ['clue_bank_key', 'clue_escort_key', 'clue_noodle_key'],
        requiredInvestigation: 4,
        rewardClue: 'clue_courtyard_key',
        isCompleted: false,
        isActive: false
    },
    {
        id: 'task6',
        title: '任务6：拼合古城记忆',
        description: '收集所有关键线索后，进入最终推理，从所有线索中选出4条关键线索，拼合账簿背后的真相。',
        targetScene: null,
        requiredClues: ['clue_cityGate_key', 'clue_bank_key', 'clue_escort_key', 'clue_noodle_key', 'clue_courtyard_key'],
        requiredInvestigation: 0,
        rewardClue: null,
        isCompleted: false,
        isActive: false
    }
];

// ========================================
// 游戏状态管理 - 升级版
// ========================================
const GameState = {
    currentScreen: 'start',
    currentScene: 'cityGate',
    collectedFragments: [],
    collectedClues: [],
    currentNPC: null,
    currentObject: null,
    isDialogueActive: false,
    isPuzzleActive: false,
    isChoicePuzzleActive: false,
    isPasswordPuzzleActive: false,
    isFinalPuzzleActive: false,
    isHintActive: false,
    selectedClues: [],
    player: {
        x: 600,
        y: 600,
        width: 32,
        height: 48,
        direction: 'down',
        isMoving: false,
    },
    keys: {},
    completedTasks: [],
    currentTaskIndex: 0,
    // 新增：调查进度
    investigationCount: {
        cityGate: 0,
        bank: 0,
        escortAgency: 0,
        noodleShop: 0,
        courtyard: 0
    },
    // 新增：已调查的物
    investigatedObjects: [],
        // 新增：已对话的NPC
        talkedNPCs: [],
        // 新增：已完成谜题的NPC
        completedNPCs: [],
        // 新增：提示使用次数
    hintUsage: {
        cityGate: 0,
        bank: 0,
        escortAgency: 0,
        noodleShop: 0,
        courtyard: 0
    }
};

// ========================================
// 图片加载器
// ========================================
class ImageLoader {
    constructor() {
        this.loadedImages = 0;
        this.totalImages = Object.keys(MAPS).length;
    }
    
    loadAllMaps(callback) {
        console.log('🖼️ 开始加载地图图片...');
        
        Object.keys(MAPS).forEach(mapKey => {
            const map = MAPS[mapKey];
            const img = new Image();
            
            img.onload = () => {
                map.imageObj = img;
                map.imageLoaded = true;
                this.loadedImages++;
                console.log(`✅ 地图图片加载成功：${map.name}`);
                
                if (this.loadedImages === this.totalImages && callback) {
                    callback();
                }
            };
            
            img.onerror = () => {
                console.warn(`⚠️ 地图图片加载失败，使用备用背景：${map.name}`);
                // 即使加载失败，也创建一个备用Image对象，避免渲染时报错
                const fallbackImg = new Image();
                fallbackImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0IjEyMD AiIGhlaWdodD0iNzQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzYTI0MTgiLz48L3N2Zz4=';
                map.imageObj = fallbackImg;
                map.imageLoaded = true; // 标记为已加载（使用备用图）
                this.loadedImages++;

                if (this.loadedImages === this.totalImages && callback) {
                    callback();
                }
            };
            
            img.src = map.image;
        });
    }
}

// ========================================
// Canvas 渲染器（升级版 - 支持多NPC和多物品）
// ========================================
class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
    }
    
    render() {
        this.ctx.fillStyle = CONFIG.FALLBACK_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawSceneBackground();
        this.drawInteractableObjects();
        this.drawNPCs();
        this.drawPlayer();
        this.drawInvestigationProgress();
    }
    
    drawSceneBackground() {
        const currentMap = MAPS[GameState.currentScene];
        
        if (currentMap.imageLoaded && currentMap.imageObj) {
            this.ctx.drawImage(
                currentMap.imageObj,
                0, 0,
                this.canvas.width, this.canvas.height
            );
        } else {
            this.drawFallbackBackground();
        }
    }
    
    drawFallbackBackground() {
        this.ctx.fillStyle = '#4a3428';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#5a4438';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 48) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 48) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.fillStyle = 'rgba(212, 165, 116, 0.3)';
        this.ctx.font = '48px Microsoft YaHei';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            MAPS[GameState.currentScene].name,
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }
    
    drawInteractableObjects() {
        const scene = SCENES[GameState.currentScene];
        if (!scene || !scene.objects) return;
        
        scene.objects.forEach(obj => {
            // 检查是否已调查过
            const isInvestigated = GameState.investigatedObjects.includes(obj.id);
            
            // 物品背景
            this.ctx.fillStyle = isInvestigated ? 'rgba(144, 238, 144, 0.2)' : 'rgba(139, 69, 19, 0.3)';
            this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            
            // 物品边框
            this.ctx.strokeStyle = isInvestigated ? '#90ee90' : '#d4a574';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
            
            // 物品图标
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(obj.emoji, obj.x + obj.width / 2, obj.y + obj.height / 2 + 8);
            
            // 如果已调查，显示✓
            if (isInvestigated) {
                this.ctx.fillStyle = '#90ee90';
                this.ctx.font = '16px Arial';
                this.ctx.fillText('✓', obj.x + obj.width / 2, obj.y - 5);
            }
        });
    }
    
    drawNPCs() {
        const scene = SCENES[GameState.currentScene];
        if (!scene || !scene.npcs) return;
        
        scene.npcs.forEach(npc => {
            // 检查NPC是否已被解锁（如果有解锁条件）
            if (npc.isUnlocked !== undefined && !npc.isUnlocked) {
                // 未解锁的NPC不显示
                return;
            }
            
            // 检查是否已对话过
            const hasTalked = GameState.talkedNPCs.includes(npc.id);
            
            // NPC身体
            this.ctx.fillStyle = hasTalked ? '#90ee90' : npc.color;
            this.ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
            
            // NPC边框
            this.ctx.strokeStyle = hasTalked ? '#90ee90' : '#d4a574';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(npc.x, npc.y, npc.width, npc.height);
            
            // NPC头像
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(npc.avatar, npc.x + npc.width / 2, npc.y + npc.height / 2 + 8);
            
            // NPC名字
            this.ctx.fillStyle = hasTalked ? '#90ee90' : '#e8dcc8';
            this.ctx.font = '11px Microsoft YaHei';
            this.ctx.fillText(npc.name, npc.x + npc.width / 2, npc.y - 5);
            
            // 如果已对话，显示✓
            if (hasTalked) {
                this.ctx.fillStyle = '#90ee90';
                this.ctx.font = '16px Arial';
                this.ctx.fillText('✓', npc.x + npc.width / 2, npc.y - 20);
            }
        });
    }
    
    drawPlayer() {
        const player = GameState.player;
        const ctx = this.ctx;
        const x = player.x;
        const y = player.y;
        const w = player.width;
        const h = player.height;
        const dir = player.direction;
        
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h - 2, w/3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 根据朝向绘制小人
        ctx.save();
        
        if (dir === 'down') {
            // 头
            ctx.fillStyle = '#f0d9b5';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h * 0.25, w * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#d4a574';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // 身体
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(x + w * 0.3, y + h * 0.4, w * 0.4, h * 0.35);
            
            // 腿
            ctx.fillStyle = '#654321';
            ctx.fillRect(x + w * 0.35, y + h * 0.75, w * 0.12, h * 0.25);
            ctx.fillRect(x + w * 0.55, y + h * 0.75, w * 0.12, h * 0.25);
            
            // 手臂
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + w * 0.3, y + h * 0.5);
            ctx.lineTo(x + w * 0.1, y + h * 0.6);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + w * 0.7, y + h * 0.5);
            ctx.lineTo(x + w * 0.9, y + h * 0.6);
            ctx.stroke();
            
        } else if (dir === 'up') {
            // 头（背面）
            ctx.fillStyle = '#f0d9b5';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h * 0.25, w * 0.25, 0, Math.PI * 2);
            ctx.fill();
            
            // 身体（背面）
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(x + w * 0.3, y + h * 0.4, w * 0.4, h * 0.35);
            
            // 腿
            ctx.fillStyle = '#654321';
            ctx.fillRect(x + w * 0.35, y + h * 0.75, w * 0.12, h * 0.25);
            ctx.fillRect(x + w * 0.55, y + h * 0.75, w * 0.12, h * 0.25);
            
        } else if (dir === 'left') {
            // 头（左侧面）
            ctx.fillStyle = '#f0d9b5';
            ctx.beginPath();
            ctx.arc(x + w * 0.35, y + h * 0.25, w * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // 身体（侧面）
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(x + w * 0.3, y + h * 0.4, w * 0.35, h * 0.35);
            
            // 腿
            ctx.fillStyle = '#654321';
            ctx.fillRect(x + w * 0.35, y + h * 0.75, w * 0.1, h * 0.25);
            ctx.fillRect(x + w * 0.5, y + h * 0.75, w * 0.1, h * 0.25);
            
            // 手臂（侧面）
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + w * 0.3, y + h * 0.5);
            ctx.lineTo(x + w * 0.1, y + h * 0.55);
            ctx.stroke();
            
        } else if (dir === 'right') {
            // 头（右侧面）
            ctx.fillStyle = '#f0d9b5';
            ctx.beginPath();
            ctx.arc(x + w * 0.65, y + h * 0.25, w * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // 身体（侧面）
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(x + w * 0.35, y + h * 0.4, w * 0.35, h * 0.35);
            
            // 腿
            ctx.fillStyle = '#654321';
            ctx.fillRect(x + w * 0.4, y + h * 0.75, w * 0.1, h * 0.25);
            ctx.fillRect(x + w * 0.55, y + h * 0.75, w * 0.1, h * 0.25);
            
            // 手臂（侧面）
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + w * 0.65, y + h * 0.5);
            ctx.lineTo(x + w * 0.9, y + h * 0.55);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // 绘制名字
        ctx.fillStyle = '#e8dcc8';
        ctx.font = '11px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('你', x + w / 2, y - 5);
    }
    
    drawInvestigationProgress() {
        const scene = SCENES[GameState.currentScene];
        if (!scene || !scene.npcs) return;
        
        // 计算当前场景有puzzle的NPC总数
        const totalNPCsWithPuzzle = scene.npcs.filter(npc => npc.puzzle).length;
        
        // 计算当前场景已完成puzzle的NPC数量
        const completedNPCs = scene.npcs.filter(npc =>
            npc.puzzle && GameState.completedNPCs && GameState.completedNPCs.includes(npc.id)
        ).length;
        
        if (totalNPCsWithPuzzle > 0) {
            const progress = Math.min(completedNPCs / totalNPCsWithPuzzle * 100, 100);
            
            // 进度条背景
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(10, 70, 200, 30);
            
            // 进度条
            this.ctx.fillStyle = '#d4a574';
            this.ctx.fillRect(15, 80, progress * 1.8, 10);
            
            // 进度文字
            this.ctx.fillStyle = '#e8dcc8';
            this.ctx.font = '12px Microsoft YaHei';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`NPC谜题：${completedNPCs}/${totalNPCsWithPuzzle}`, 20, 90);
        }
    }
}

console.log('🎮 Script.js 第二部分（ImageLoader、GameRenderer）加载完成！');

// ========================================
// 游戏引擎（升级版 - 支持多NPC、多物品、调查进度）
// ========================================
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new GameRenderer(this.canvas);
        this.isRunning = false;
        this.imageLoader = new ImageLoader();
    }
    
    init() {
        this.bindEvents();
        this.loadMaps();
    }
    
    loadMaps() {
        this.imageLoader.loadAllMaps(() => {
            console.log('🖼️ 所有地图图片加载完成！');
        });
    }
    
    bindEvents() {
        window.addEventListener('keydown', (e) => {
            GameState.keys[e.key.toLowerCase()] = true;
            
            // 按E键交互
            if (e.key.toLowerCase() === 'e' && 
                !GameState.isDialogueActive && 
                !GameState.isPuzzleActive && 
                !GameState.isChoicePuzzleActive && 
                !GameState.isPasswordPuzzleActive && 
                !GameState.isFinalPuzzleActive &&
                !GameState.isHintActive) {
                this.checkInteraction();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            GameState.keys[e.key.toLowerCase()] = false;
        });
    }
    
    switchScene(sceneId) {
        if (!MAPS[sceneId]) return;

        console.log(`🗺️ 切换到场景：${MAPS[sceneId].name}`);

        // 等待地图图片加载完成再切换场景
        if (!MAPS[sceneId].imageLoaded || !MAPS[sceneId].imageObj) {
            console.log(`⏳ 等待地图图片加载：${sceneId}`);
            const checkLoaded = setInterval(() => {
                if (MAPS[sceneId].imageLoaded && MAPS[sceneId].imageObj) {
                    clearInterval(checkLoaded);
                    this.finishSwitchScene(sceneId);
                }
            }, 50);
            return;
        }

        this.finishSwitchScene(sceneId);
    }

    finishSwitchScene(sceneId) {
        GameState.currentScene = sceneId;

        const playerStart = MAPS[sceneId].playerStart;
        GameState.player.x = playerStart.x;
        GameState.player.y = playerStart.y;

        this.updateHUD();
        this.updateInvestigationDisplay();
    }
    
    handleInput() {
        const player = GameState.player;
        const speed = CONFIG.PLAYER_SPEED;
        const boundaries = MAPS[GameState.currentScene].boundaries;
        
        let newX = player.x;
        let newY = player.y;
        
        if (GameState.keys['arrowup'] || GameState.keys['w']) {
            newY -= speed;
            player.direction = 'up';
            player.isMoving = true;
        } else if (GameState.keys['arrowdown'] || GameState.keys['s']) {
            newY += speed;
            player.direction = 'down';
            player.isMoving = true;
        } else if (GameState.keys['arrowleft'] || GameState.keys['a']) {
            newX -= speed;
            player.direction = 'left';
            player.isMoving = true;
        } else if (GameState.keys['arrowright'] || GameState.keys['d']) {
            newX += speed;
            player.direction = 'right';
            player.isMoving = true;
        } else {
            player.isMoving = false;
        }
        
        // 边界检查
        if (newX >= boundaries.minX && newX <= boundaries.maxX - player.width) {
            player.x = newX;
        }
        if (newY >= boundaries.minY && newY <= boundaries.maxY - player.height) {
            player.y = newY;
        }
        
        this.checkNearbyNPC();
        this.checkNearbyObject();
    }
    
    checkNearbyNPC() {
        const player = GameState.player;
        const scene = SCENES[GameState.currentScene];
        if (!scene || !scene.npcs) return;
        
        let nearbyNPC = null;
        let minDistance = CONFIG.INTERACT_DISTANCE;
        
        scene.npcs.forEach(npc => {
            // 检查NPC是否已被解锁
            if (npc.isUnlocked !== undefined && !npc.isUnlocked) {
                return;
            }
            
            const distance = Math.sqrt(
                Math.pow(player.x + player.width / 2 - (npc.x + npc.width / 2), 2) +
                Math.pow(player.y + player.height / 2 - (npc.y + npc.height / 2), 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearbyNPC = npc;
            }
        });
        
        const prompt = document.getElementById('interact-prompt');
        if (nearbyNPC) {
            prompt.style.display = 'block';
            prompt.querySelector('p').innerHTML = `按 <span class="key">E</span> 与${nearbyNPC.name}对话`;
            GameState.currentNPC = nearbyNPC;
            GameState.currentObject = null;
        } else {
            if (!GameState.currentObject) {
                prompt.style.display = 'none';
                GameState.currentNPC = null;
            }
        }
    }
    
    checkNearbyObject() {
        const player = GameState.player;
        const scene = SCENES[GameState.currentScene];
        if (!scene || !scene.objects) return;
        
        let nearbyObject = null;
        let minDistance = CONFIG.INTERACT_DISTANCE;
        
        scene.objects.forEach(obj => {
            const distance = Math.sqrt(
                Math.pow(player.x + player.width / 2 - (obj.x + obj.width / 2), 2) +
                Math.pow(player.y + player.height / 2 - (obj.y + obj.height / 2), 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearbyObject = obj;
            }
        });
        
        const prompt = document.getElementById('interact-prompt');
        if (nearbyObject && !GameState.currentNPC) {
            const isInvestigated = GameState.investigatedObjects.includes(nearbyObject.id);
            prompt.style.display = 'block';
            prompt.querySelector('p').innerHTML = `按 <span class="key">E</span> 调查：${nearbyObject.name}${isInvestigated ? '（已调查）' : ''}`;
            GameState.currentObject = nearbyObject;
        } else if (!GameState.currentNPC) {
            prompt.style.display = 'none';
            GameState.currentObject = null;
        }
    }
    
    checkInteraction() {
        if (GameState.currentNPC) {
            this.interactWithNPC();
        } else if (GameState.currentObject) {
            this.interactWithObject();
        }
    }
    
    interactWithNPC() {
        const npc = GameState.currentNPC;
        
        // 检查是否已经完成谜题
        if (GameState.completedNPCs && GameState.completedNPCs.includes(npc.id)) {
            this.showDialogue([`你已经和${npc.name}聊过了，他没有更多话要说。`]);
            return;
        }
        
        // 检查是否已经对话过（但未完成谜题）
        if (GameState.talkedNPCs.includes(npc.id) && npc.puzzle) {
            // 已经对话过，直接进入问答模式
            this.startNPCPuzzle(npc);
            return;
        }
        
        // 显示对话
        this.showDialogue(npc.dialogues, () => {
            // 对话结束后，检查是否有谜题
            if (npc.puzzle) {
                // 进入问答模式
                this.startNPCPuzzle(npc);
            } else {
                // 没有谜题，直接标记为已对话
                if (!GameState.talkedNPCs.includes(npc.id)) {
                    GameState.talkedNPCs.push(npc.id);
                }
                
                // 更新调查进度
                this.updateInvestigationCount();
                
                // 检查是否可以触发场景谜题
                this.checkPuzzleTrigger();
            }
        });
    }
    
    interactWithObject() {
        const obj = GameState.currentObject;
        
        // 显示物品描述
        this.showDialogue([obj.description], () => {
            // 标记为已调查
            if (!GameState.investigatedObjects.includes(obj.id)) {
                GameState.investigatedObjects.push(obj.id);
                
                // 更新调查进度
                this.updateInvestigationCount();
            }
            
            // 如果物品有线索，收集线索
            if (obj.clueId && !GameState.collectedClues.includes(obj.clueId)) {
                this.collectClue(obj.clueId);
            }
        });
    }
    
    // NPC问答模式：对话结束后，NPC提问，玩家根据线索回答
    startNPCPuzzle(npc) {
        GameState.isPuzzleActive = true;
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        const puzzleQuestion = document.getElementById('puzzle-question');
        const puzzleAnswer = document.getElementById('puzzle-answer');
        const puzzleHint = document.getElementById('puzzle-hint');
        const submitBtn = document.getElementById('submit-answer');
        
        puzzleOverlay.style.display = 'block';
        puzzleQuestion.textContent = npc.puzzle.question;
        puzzleAnswer.value = '';
        puzzleHint.textContent = '';
        
        const handleSubmit = () => {
            const userAnswer = puzzleAnswer.value.trim();
            
            if (!userAnswer) {
                puzzleHint.textContent = '请输入答案！';
                puzzleHint.style.color = '#d4a574';
                return;
            }
            
            // 检查答案是否正确（允许模糊匹配）
            const normalizedUser = userAnswer.replace(/\s+/g, '').toLowerCase();
            const normalizedCorrect = npc.puzzle.answer.replace(/\s+/g, '').toLowerCase();
            
            if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) {
                puzzleHint.textContent = '✅ 答案正确！';
                puzzleHint.style.color = '#90ee90';
                
                // 标记为已完成
                if (!GameState.completedNPCs) {
                    GameState.completedNPCs = [];
                }
                if (!GameState.completedNPCs.includes(npc.id)) {
                    GameState.completedNPCs.push(npc.id);
                }
                
                // 标记为已对话
                if (!GameState.talkedNPCs.includes(npc.id)) {
                    GameState.talkedNPCs.push(npc.id);
                }
                
                setTimeout(() => {
                    puzzleOverlay.style.display = 'none';
                    GameState.isPuzzleActive = false;
                    
                    // 显示成功对话
                    if (npc.puzzle.successDialogues) {
                        this.showDialogue(npc.puzzle.successDialogues, () => {
                            // 给予奖励
                            if (npc.puzzle.reward) {
                                this.collectClue(npc.puzzle.reward);
                            }
                            
                            // 更新调查进度
                            this.updateInvestigationCount();
                            
                            // 检查是否可以触发场景谜题
                            this.checkPuzzleTrigger();
                        });
                    }
                }, 1500);
            } else {
                puzzleHint.textContent = '❌ 答案不正确，再想想看！';
                puzzleHint.style.color = '#ff6b6b';
                
                setTimeout(() => {
                    puzzleHint.textContent = npc.puzzle.hint || '提示：再仔细想想...';
                    puzzleHint.style.color = '#d4a574';
                }, 1500);
            }
        };
        
        submitBtn.onclick = handleSubmit;
        
        puzzleAnswer.onkeypress = (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        };
    }
    
    updateInvestigationCount() {
        const sceneId = GameState.currentScene;
        const scene = SCENES[sceneId];
        
        if (!scene) return;
        
        let count = 0;
        
        // 计算已对话的NPC数量
        if (scene.npcs) {
            scene.npcs.forEach(npc => {
                if (GameState.talkedNPCs.includes(npc.id)) {
                    count++;
                }
            });
        }
        
        // 计算已调查的物品数量
        if (scene.objects) {
            scene.objects.forEach(obj => {
                if (GameState.investigatedObjects.includes(obj.id)) {
                    count++;
                }
            });
        }
        
        GameState.investigationCount[sceneId] = count;
        this.updateInvestigationDisplay();
        
        // 检查任务更新
        this.updateTasks();
    }
    
    updateInvestigationDisplay() {
        const sceneId = GameState.currentScene;
        const scene = SCENES[sceneId];
        
        if (!scene || !scene.npcs) return;
        
        // 计算当前场景有puzzle的NPC总数
        const totalNPCsWithPuzzle = scene.npcs.filter(npc => npc.puzzle).length;
        
        // 计算当前场景已完成puzzle的NPC数量
        const completedNPCs = scene.npcs.filter(npc => 
            npc.puzzle && GameState.completedNPCs && GameState.completedNPCs.includes(npc.id)
        ).length;
        
        const display = document.getElementById('hud-investigation');
        if (display) {
            display.textContent = `${completedNPCs}/${totalNPCsWithPuzzle}`;
        }
    }
    
    checkPuzzleTrigger() {
        const sceneId = GameState.currentScene;
        const scene = SCENES[sceneId];
        
        if (!scene || !scene.npcs) return;
        
        // 检查当前场景是否有NPC有puzzle
        const npcsWithPuzzle = scene.npcs.filter(npc => npc.puzzle);
        
        if (npcsWithPuzzle.length === 0) return;
        
        // 检查是否所有有puzzle的NPC都完成了
        const allCompleted = npcsWithPuzzle.every(npc => 
            GameState.completedNPCs && GameState.completedNPCs.includes(npc.id)
        );
        
        // 如果都完成了，给予记忆碎片
        if (allCompleted && !GameState.collectedFragments.includes(sceneId)) {
            console.log(`🎉 场景 ${sceneId} 的所有NPC谜题已完成！获得记忆碎片！`);
            
            // 给予记忆碎片
            GameState.collectedFragments.push(sceneId);
            this.updateHUD();
            this.updateMapSelectStatus();
            
            // 显示获得记忆碎片的提示
            this.showDialogue([
                `🎉 恭喜！你已完成【${scene.title}】的所有谜题！`,
                '你获得了记忆碎片！',
                `当前已收集 ${GameState.collectedFragments.length}/5 个记忆碎片。`
            ], () => {
                this.updateTasks();
                
                // 如果收集了5个碎片，显示最终推理
                if (GameState.collectedFragments.length === 5) {
                    setTimeout(() => {
                        this.showFinalPuzzle();
                    }, 1000);
                }
            });
        }
    }
    
    collectClue(clueId) {
        if (!GameState.collectedClues.includes(clueId)) {
            GameState.collectedClues.push(clueId);
            console.log(`📜 获得线索：${clueId}`);
            
            // 显示获得线索的提示
            const clue = this.findClueById(clueId);
            if (clue) {
                this.showDialogue([`你获得了线索：【${clue.name}】！`, clue.description]);
            }
            
            // 更新任务
            this.updateTasks();
            
            // 更新手账UI
            if (window.gameEngine) {
                window.gameEngine.updateNotebookUI();
            }
        }
    }
    
    findClueById(clueId) {
        // 在所有场景中查找线索
        for (const sceneId in SCENES) {
            const scene = SCENES[sceneId];
            if (scene.clues) {
                const clue = scene.clues.find(c => c.id === clueId);
                if (clue) return clue;
            }
            if (scene.distractionClues) {
                const clue = scene.distractionClues.find(c => c.id === clueId);
                if (clue) return clue;
            }
        }
        
        // 也在FINAL_PUZZLE中查找
        const finalClue = FINAL_PUZZLE.allClues.find(c => c.id === clueId);
        if (finalClue) {
            return {
                id: finalClue.id,
                name: finalClue.name,
                icon: finalClue.icon,
                source: '最终推理',
                description: '这是一条关键线索。',
                isKeyClue: true,
                isDistraction: false
            };
        }
        
        return null;
    }
    
    showDialogue(dialogueArray, callback) {
        GameState.isDialogueActive = true;
        const dialogueBox = document.getElementById('dialogue-box');
        const dialogueText = document.getElementById('dialogue-text');
        const dialogueNPCName = document.getElementById('dialogue-npc-name');
        const nextBtn = document.getElementById('dialogue-next');
        
        let currentIndex = 0;
        
        // 设置NPC名字
        if (GameState.currentNPC) {
            dialogueNPCName.textContent = GameState.currentNPC.name;
        } else if (GameState.currentObject) {
            dialogueNPCName.textContent = GameState.currentObject.name;
        } else {
            dialogueNPCName.textContent = '系统';
        }
        
        dialogueBox.style.display = 'block';
        dialogueText.textContent = dialogueArray[currentIndex];
        
        const showNext = () => {
            currentIndex++;
            if (currentIndex < dialogueArray.length) {
                dialogueText.textContent = dialogueArray[currentIndex];
            } else {
                closeDialogue();
                if (callback) callback();
            }
        };
        
        nextBtn.onclick = showNext;
        
        const handleKeyPress = (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                showNext();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        
        const closeDialogue = () => {
            dialogueBox.style.display = 'none';
            GameState.isDialogueActive = false;
            window.removeEventListener('keydown', handleKeyPress);
        };
        
        // 用户只能通过"继续"按钮推进对话，移除关闭按钮
    }
    
    showPuzzle(sceneId) {
        const scene = SCENES[sceneId];
        if (!scene || !scene.puzzle) return;
        
        if (scene.puzzle.type === 'text') {
            this.showTextPuzzle(sceneId);
        } else if (scene.puzzle.type === 'choice') {
            this.showChoicePuzzle(sceneId);
        } else if (scene.puzzle.type === 'password') {
            this.showPasswordPuzzle(sceneId);
        }
    }
    
    showTextPuzzle(sceneId) {
        GameState.isPuzzleActive = true;
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        const puzzleQuestion = document.getElementById('puzzle-question');
        const puzzleAnswer = document.getElementById('puzzle-answer');
        const puzzleHint = document.getElementById('puzzle-hint');
        const submitBtn = document.getElementById('submit-answer');
        const closeBtn = document.getElementById('puzzle-close');
        
        const scene = SCENES[sceneId];
        
        puzzleOverlay.style.display = 'block';
        puzzleQuestion.textContent = scene.puzzle.question;
        puzzleAnswer.value = '';
        puzzleHint.textContent = '';
        
        const handleSubmit = () => {
            const userAnswer = puzzleAnswer.value.trim();
            
            if (!userAnswer) {
                puzzleHint.textContent = '请输入答案！';
                puzzleHint.style.color = '#d4a574';
                return;
            }
            
            const correctAnswer = scene.puzzle.answer;
            const normalizedUserAnswer = userAnswer.replace(/\s+/g, '');
            const normalizedCorrectAnswer = correctAnswer.replace(/\s+/g, '');
            
            if (normalizedUserAnswer === normalizedCorrectAnswer) {
                puzzleHint.textContent = '✅ 答案正确！';
                puzzleHint.style.color = '#90ee90';
                
                // 收集记忆碎片
                if (!GameState.collectedFragments.includes(sceneId)) {
                    GameState.collectedFragments.push(sceneId);
                    this.updateHUD();
                    this.updateMapSelectStatus();
                }
                
                setTimeout(() => {
                    puzzleOverlay.style.display = 'none';
                    GameState.isPuzzleActive = false;
                    this.showDialogue([scene.puzzle.successText], () => {
                        this.updateTasks();
                        
                        // 如果收集了5个碎片，显示最终推理
                        if (GameState.collectedFragments.length === 5) {
                            setTimeout(() => {
                                this.showFinalPuzzle();
                            }, 1000);
                        }
                    });
                }, 1500);
            } else {
                puzzleHint.textContent = '❌ 答案不正确，再想想看！';
                puzzleHint.style.color = '#ff6b6b';
                
                setTimeout(() => {
                    puzzleHint.textContent = scene.puzzle.hint;
                    puzzleHint.style.color = '#d4a574';
                }, 1500);
            }
        };
        
        submitBtn.onclick = handleSubmit;
        
        puzzleAnswer.onkeypress = (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        };
    }
    
    showChoicePuzzle(sceneId) {
        GameState.isChoicePuzzleActive = true;
        const puzzleOverlay = document.getElementById('choice-puzzle-overlay');
        const puzzleQuestion = document.getElementById('choice-puzzle-question');
        const choiceOptions = document.getElementById('choice-options');
        const puzzleHint = document.getElementById('choice-puzzle-hint');
        const closeBtn = document.getElementById('choice-puzzle-close');
        
        const scene = SCENES[sceneId];
        
        puzzleOverlay.style.display = 'block';
        puzzleQuestion.textContent = scene.puzzle.question;
        puzzleHint.textContent = '';
        
        choiceOptions.innerHTML = '';
        
        scene.puzzle.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'choice-option';
            optionElement.textContent = option;
            optionElement.dataset.index = index;
            
            optionElement.onclick = () => {
                choiceOptions.querySelectorAll('.choice-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                optionElement.classList.add('selected');
                
                if (index === scene.puzzle.correctAnswer) {
                    optionElement.classList.add('correct');
                    puzzleHint.textContent = '✅ 答案正确！';
                    puzzleHint.style.color = '#90ee90';
                    
                    // 收集记忆碎片
                    if (!GameState.collectedFragments.includes(sceneId)) {
                        GameState.collectedFragments.push(sceneId);
                        this.updateHUD();
                        this.updateMapSelectStatus();
                    }
                    
                    setTimeout(() => {
                        puzzleOverlay.style.display = 'none';
                        GameState.isChoicePuzzleActive = false;
                        this.showDialogue([scene.puzzle.successText], () => {
                            this.updateTasks();
                            
                            if (GameState.collectedFragments.length === 5) {
                                setTimeout(() => {
                                    this.showFinalPuzzle();
                                }, 1000);
                            }
                        });
                    }, 1500);
                } else {
                    optionElement.classList.add('wrong');
                    puzzleHint.textContent = '❌ 答案不正确，再想想看！';
                    puzzleHint.style.color = '#ff6b6b';
                    
                    setTimeout(() => {
                        optionElement.classList.remove('wrong');
                        puzzleHint.textContent = scene.puzzle.hint;
                        puzzleHint.style.color = '#d4a574';
                    }, 1500);
                }
            };
            
            choiceOptions.appendChild(optionElement);
        });
    }
    
    showPasswordPuzzle(sceneId) {
        GameState.isPasswordPuzzleActive = true;
        const puzzleOverlay = document.getElementById('password-puzzle-overlay');
        const puzzleQuestion = document.getElementById('password-puzzle-question');
        const puzzleHint = document.getElementById('password-puzzle-hint');
        const passwordDigits = document.querySelectorAll('.password-digit');
        const passwordBtns = document.querySelectorAll('.password-btn');
        const passwordClear = document.getElementById('password-clear');
        const passwordSubmit = document.getElementById('password-submit');
        const closeBtn = document.getElementById('password-puzzle-close');
        
        const scene = SCENES[sceneId];
        
        // 检查前置条件
        if (scene.puzzle.requiredClues) {
            const hasAllClues = scene.puzzle.requiredClues.every(clueId => 
                GameState.collectedClues.includes(clueId)
            );
            
            if (!hasAllClues) {
                puzzleOverlay.style.display = 'block';
                puzzleQuestion.textContent = scene.puzzle.question;
                puzzleHint.textContent = scene.puzzle.failText;
                puzzleHint.style.color = '#ff6b6b';
                
                setTimeout(() => {
                    puzzleOverlay.style.display = 'none';
                    GameState.isPasswordPuzzleActive = false;
                }, 2000);
                return;
            }
        }
        
        puzzleOverlay.style.display = 'block';
        puzzleQuestion.textContent = scene.puzzle.question;
        puzzleHint.textContent = '';
        
        let currentPassword = ['', '', ''];
        let currentDigitIndex = 0;
        
        passwordDigits.forEach((digit, index) => {
            digit.textContent = '';
            digit.classList.remove('filled');
        });
        
        passwordBtns.forEach(btn => {
            btn.onclick = () => {
                const value = btn.dataset.value;
                
                if (currentDigitIndex < 3) {
                    currentPassword[currentDigitIndex] = value;
                    passwordDigits[currentDigitIndex].textContent = value;
                    passwordDigits[currentDigitIndex].classList.add('filled');
                    currentDigitIndex++;
                }
            };
        });
        
        passwordClear.onclick = () => {
            currentPassword = ['', '', ''];
            currentDigitIndex = 0;
            passwordDigits.forEach(digit => {
                digit.textContent = '';
                digit.classList.remove('filled');
            });
            puzzleHint.textContent = '';
        };
        
        passwordSubmit.onclick = () => {
            const userAnswer = currentPassword.join('');
            const correctAnswer = scene.puzzle.answer;
            
            if (userAnswer === correctAnswer) {
                puzzleHint.textContent = '✅ 密码正确！';
                puzzleHint.style.color = '#90ee90';
                
                // 收集记忆碎片
                if (!GameState.collectedFragments.includes(sceneId)) {
                    GameState.collectedFragments.push(sceneId);
                    this.updateHUD();
                    this.updateMapSelectStatus();
                }
                
                setTimeout(() => {
                    puzzleOverlay.style.display = 'none';
                    GameState.isPasswordPuzzleActive = false;
                    this.showDialogue([scene.puzzle.successText], () => {
                        this.updateTasks();
                        
                        if (GameState.collectedFragments.length === 5) {
                            setTimeout(() => {
                                this.showFinalPuzzle();
                            }, 1000);
                        }
                    });
                }, 1500);
            } else {
                puzzleHint.textContent = '❌ 密码不正确，再试试看！';
                puzzleHint.style.color = '#ff6b6b';
                
                setTimeout(() => {
                    puzzleHint.textContent = scene.puzzle.hint;
                    puzzleHint.style.color = '#d4a574';
                }, 1500);
            }
        };
    }
    
    showFinalPuzzle() {
        GameState.isFinalPuzzleActive = true;
        const puzzleOverlay = document.getElementById('final-puzzle-overlay');
        const clueSelection = document.getElementById('clue-selection');
        const puzzleHint = document.getElementById('final-puzzle-hint');
        
        puzzleOverlay.style.display = 'block';
        puzzleHint.textContent = '';
        GameState.selectedClues = [];
        
        clueSelection.innerHTML = '';
        
        FINAL_PUZZLE.allClues.forEach(clue => {
            const clueElement = document.createElement('div');
            clueElement.className = 'clue-option';
            clueElement.dataset.clueId = clue.id;
            
            const isCollected = GameState.collectedClues.includes(clue.id);
            const isDistraction = clue.id.includes('distraction');
            
            clueElement.innerHTML = `
                <div class="clue-icon">${clue.icon}</div>
                <div class="clue-name">${clue.name}</div>
                <div class="clue-status">${isCollected ? '已获得' : '未获得'}</div>
            `;
            
            if (isCollected && !isDistraction) {
                clueElement.onclick = () => {
                    if (GameState.selectedClues.includes(clue.id)) {
                        GameState.selectedClues = GameState.selectedClues.filter(id => id !== clue.id);
                        clueElement.classList.remove('selected');
                    } else if (GameState.selectedClues.length < 4) {
                        GameState.selectedClues.push(clue.id);
                        clueElement.classList.add('selected');
                    }
                };
            } else if (isDistraction) {
                clueElement.style.opacity = '0.5';
                clueElement.style.cursor = 'not-allowed';
            } else {
                clueElement.style.opacity = '0.5';
                clueElement.style.cursor = 'not-allowed';
            }
            
            clueSelection.appendChild(clueElement);
        });
        
        document.getElementById('submit-final-puzzle').onclick = () => {
            if (GameState.selectedClues.length !== 4) {
                puzzleHint.textContent = '请选择4个线索！';
                puzzleHint.style.color = '#ff6b6b';
                return;
            }
            
            const isCorrect = GameState.selectedClues.every(clueId => 
                FINAL_PUZZLE.correctClues.includes(clueId)
            ) && GameState.selectedClues.length === 4;
            
            if (isCorrect) {
                puzzleHint.textContent = '✅ 推理正确！';
                puzzleHint.style.color = '#90ee90';
                
                setTimeout(() => {
                    puzzleOverlay.style.display = 'none';
                    GameState.isFinalPuzzleActive = false;
                    this.showDialogue(FINAL_PUZZLE.successText.split('\n'), () => {
                        showEnding();
                    });
                }, 1500);
            } else {
                puzzleHint.textContent = '❌ 推理不正确，再想想看！这些线索还不能完整解释账簿背后的故事。';
                puzzleHint.style.color = '#ff6b6b';
            }
        };
        
        document.getElementById('cancel-final-puzzle').onclick = () => {
            puzzleOverlay.style.display = 'none';
            GameState.isFinalPuzzleActive = false;
        };
    }
    
    showHint() {
        GameState.isHintActive = true;
        const hintOverlay = document.getElementById('hint-overlay');
        const hintDisplay = document.getElementById('hint-display');
        
        hintOverlay.style.display = 'block';
        hintDisplay.innerHTML = '<p>点击上方按钮获取提示...</p>';
        
        // 轻提示（免费）
        document.getElementById('hint-level-1').onclick = () => {
            const hints = HINTS[GameState.currentScene];
            if (hints && hints[0]) {
                hintDisplay.innerHTML = `<p>${hints[0].text}</p>`;
            }
        };
        
        // 中提示（消耗1线索）
        document.getElementById('hint-level-2').onclick = () => {
            if (GameState.collectedClues.length < 1) {
                hintDisplay.innerHTML = '<p>线索不足，无法获取中提示！</p>';
                return;
            }
            
            const hints = HINTS[GameState.currentScene];
            if (hints && hints[1]) {
                hintDisplay.innerHTML = `<p>${hints[1].text}</p>`;
                // 消耗1条线索
                GameState.collectedClues.pop();
                this.updateNotebookUI();
            }
        };
        
        // 强提示（消耗2线索）
        document.getElementById('hint-level-3').onclick = () => {
            if (GameState.collectedClues.length < 2) {
                hintDisplay.innerHTML = '<p>线索不足，无法获取强提示！</p>';
                return;
            }
            
            const hints = HINTS[GameState.currentScene];
            if (hints && hints[2]) {
                hintDisplay.innerHTML = `<p>${hints[2].text}</p>`;
                // 消耗2条线索
                GameState.collectedClues.pop();
                GameState.collectedClues.pop();
                this.updateNotebookUI();
            }
        };
        
        document.getElementById('hint-close').onclick = () => {
            hintOverlay.style.display = 'none';
            GameState.isHintActive = false;
        };
    }
    
    updateHUD() {
        const hudFragments = document.getElementById('hud-fragments');
        if (hudFragments) {
            hudFragments.textContent = `${GameState.collectedFragments.length}/5`;
        }
        
        const locationTitle = document.getElementById('location-title');
        if (locationTitle) {
            locationTitle.textContent = MAPS[GameState.currentScene].name;
        }
    }
    
    updateMapSelectStatus() {
        Object.keys(MAPS).forEach(mapKey => {
            const statusBadge = document.getElementById(`status-${mapKey}`);
            if (statusBadge) {
                if (GameState.collectedFragments.includes(mapKey)) {
                    statusBadge.textContent = '已探索';
                    statusBadge.classList.add('explored');
                }
            }
        });
        
        const mapSelectFragments = document.getElementById('map-select-fragments');
        if (mapSelectFragments) {
            mapSelectFragments.textContent = GameState.collectedFragments.length;
        }
        
        if (GameState.collectedFragments.length === 5) {
            const endingBtn = document.getElementById('map-select-ending');
            if (endingBtn) {
                endingBtn.style.display = 'inline-block';
            }
        }
    }
    
    updateTasks() {
        TASKS.forEach((task, index) => {
            if (task.isCompleted) return;
            
            let canComplete = true;
            
            // 检查所需线索
            if (task.requiredClues && task.requiredClues.length > 0) {
                task.requiredClues.forEach(clueId => {
                    if (!GameState.collectedClues.includes(clueId)) {
                        canComplete = false;
                    }
                });
            }
            
            // 检查调查进度
            if (task.requiredInvestigation) {
                const sceneId = task.targetScene;
                if (sceneId && GameState.investigationCount[sceneId] < task.requiredInvestigation) {
                    canComplete = false;
                }
            }
            
            // 检查奖励线索是否已收集
            if (task.rewardClue && GameState.collectedClues.includes(task.rewardClue)) {
                canComplete = true;
            }
            
            if (canComplete && !task.isCompleted) {
                task.isCompleted = true;
                GameState.completedTasks.push(task.id);
                
                // 激活下一个任务
                if (index + 1 < TASKS.length) {
                    TASKS[index + 1].isActive = true;
                }
            }
        });
        
        this.updateTasksUI();
    }
    
    updateTasksUI() {
        const tasksBody = document.getElementById('tasks-body');
        if (!tasksBody) return;
        
        tasksBody.innerHTML = '';
        
        TASKS.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            
            if (task.isCompleted) {
                taskElement.classList.add('completed');
            } else if (task.isActive) {
                taskElement.classList.add('active');
            }
            
            // 计算当前场景的NPC谜题完成进度
            const scene = SCENES[task.targetScene];
            let progressText = '';
            
            if (scene && scene.npcs) {
                const totalNPCsWithPuzzle = scene.npcs.filter(npc => npc.puzzle).length;
                const completedNPCs = scene.npcs.filter(npc => 
                    npc.puzzle && GameState.completedNPCs && GameState.completedNPCs.includes(npc.id)
                ).length;
                
                progressText = `（NPC谜题：${completedNPCs}/${totalNPCsWithPuzzle}）`;
            }
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <span class="task-status">${task.isCompleted ? '✅' : '⏳'}</span>
                    <span class="task-title">${task.title}</span>
                </div>
                <div class="task-description">${task.description}</div>
                <div class="task-progress">${progressText}</div>
            `;
            
            tasksBody.appendChild(taskElement);
        });
    }
    
    updateNotebookUI() {
        const cluesList = document.getElementById('clues-list');
        if (!cluesList) return;
        
        cluesList.innerHTML = '';
        
        if (GameState.collectedClues.length === 0) {
            cluesList.innerHTML = '<p class="empty-hint">暂无线索，快去探索吧！</p>';
            return;
        }
        
        GameState.collectedClues.forEach(clueId => {
            const clue = this.findClueById(clueId);
            if (!clue) return;
            
            const clueElement = document.createElement('div');
            clueElement.className = `clue-item ${clue.isKeyClue ? 'key-clue' : ''} ${clue.isDistraction ? 'distraction-clue' : ''}`;
            clueElement.innerHTML = `
                <div class="clue-header">
                    <span class="clue-icon">${clue.icon}</span>
                    <span class="clue-name">${clue.name}</span>
                    ${clue.isKeyClue ? '<span class="clue-type">关键线索</span>' : ''}
                    ${clue.isDistraction ? '<span class="clue-type">干扰线索</span>' : ''}
                    <span class="clue-source">${clue.source}</span>
                </div>
                <div class="clue-description">${clue.description}</div>
            `;
            
            cluesList.appendChild(clueElement);
        });
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        this.handleInput();
        this.renderer.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
}

console.log('🎮 Script.js 第三部分（GameEngine）加载完成！');

// ========================================
// 界面切换功能
// ========================================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        GameState.currentScreen = screenId;
        
        if (screenId === 'game') {
            startGame();
        }
        
        if (screenId === 'map-select') {
            updateMapSelectScreen();
        }
        
        if (screenId === 'notebook') {
            if (window.gameEngine) {
                window.gameEngine.updateNotebookUI();
            }
        }
        
        if (screenId === 'tasks') {
            if (window.gameEngine) {
                window.gameEngine.updateTasksUI();
            }
        }
    }
}

function startGame() {
    if (!window.gameEngine) {
        window.gameEngine = new GameEngine();
        window.gameEngine.init();
    } else {
        window.gameEngine.isRunning = true;
        window.gameEngine.start();
    }
    
    if (window.gameEngine) {
        window.gameEngine.updateHUD();
    }
}

function updateMapSelectScreen() {
    const mapSelectFragments = document.getElementById('map-select-fragments');
    if (mapSelectFragments) {
        mapSelectFragments.textContent = GameState.collectedFragments.length;
    }
    
    Object.keys(MAPS).forEach(mapKey => {
        const statusBadge = document.getElementById(`status-${mapKey}`);
        const mapCard = document.querySelector(`[data-scene="${mapKey}"]`);
        
        if (statusBadge) {
            if (GameState.collectedFragments.includes(mapKey)) {
                statusBadge.textContent = '已探索';
                statusBadge.classList.add('explored');
            }
        }
        
        if (mapCard) {
            if (GameState.collectedFragments.includes(mapKey)) {
                mapCard.classList.add('explored');
            }
        }
    });
    
    if (GameState.collectedFragments.length === 5) {
        const endingBtn = document.getElementById('map-select-ending');
        if (endingBtn) {
            endingBtn.style.display = 'inline-block';
        }
    }
}

function showEnding() {
    if (window.gameEngine) {
        window.gameEngine.stop();
    }
    
    const fragmentsList = document.getElementById('fragments-list');
    const evaluationText = document.getElementById('evaluation-text');
    
    fragmentsList.innerHTML = '';
    
    GameState.collectedFragments.forEach(fragmentId => {
        const sceneData = SCENES[fragmentId];
        if (sceneData) {
            const li = document.createElement('li');
            li.innerHTML = `${sceneData.npcs[0].avatar} <strong>${sceneData.fragmentName}</strong>`;
            fragmentsList.appendChild(li);
        }
    });
    
    // 评分系统
    const explorationScore = Math.round((GameState.collectedFragments.length / 5) * 100);
    const memoryScore = Math.round((GameState.collectedClues.length / 5) * 100);
    const cultureScore = Math.round((GameState.completedTasks.length / 6) * 100);
    const inheritanceScore = Math.round((GameState.investigatedObjects.length / 20) * 100);
    
    const scoreExploration = document.getElementById('score-exploration');
    const scoreMemory = document.getElementById('score-memory');
    const scoreCulture = document.getElementById('score-culture');
    const scoreInheritance = document.getElementById('score-inheritance');
    
    if (scoreExploration) scoreExploration.style.width = `${explorationScore}%`;
    if (scoreMemory) scoreMemory.style.width = `${memoryScore}%`;
    if (scoreCulture) scoreCulture.style.width = `${cultureScore}%`;
    if (scoreInheritance) scoreInheritance.style.width = `${inheritanceScore}%`;
    
    document.getElementById('score-exploration-value').textContent = `${explorationScore}%`;
    document.getElementById('score-memory-value').textContent = `${memoryScore}%`;
    document.getElementById('score-culture-value').textContent = `${cultureScore}%`;
    document.getElementById('score-inheritance-value').textContent = `${inheritanceScore}%`;
    
    let evaluation = '';
    
    if (explorationScore === 100 && memoryScore >= 80) {
        evaluation = '🌟 完美探索！你对平遥古城的文化有了全面的了解，从城墙历史到票号智慧，从镖局传奇到面食文化，再到民居艺术，你已经成为一名合格的平遥文化使者！';
    } else if (explorationScore >= 60) {
        evaluation = '👍 不错的探索！你对平遥古城的文化有了一定的了解，但还有一些角落等待你去发现。建议再深入体验一下未探索的地点。';
    } else {
        evaluation = '💪 继续加油！平遥古城有着深厚的文化底蕴，建议你慢慢探索每个地点，感受晋商文化的魅力。';
    }
    
    evaluationText.textContent = evaluation;
    
    showScreen('ending');
}

// ========================================
// 事件绑定
// ========================================
function initEventListeners() {
    // 开始按钮
    document.getElementById('start-btn').addEventListener('click', () => {
        showScreen('map-select');
    });
    
    // 场景选择卡片
    document.querySelectorAll('.map-select-card').forEach(card => {
        card.addEventListener('click', () => {
            const sceneId = card.getAttribute('data-scene');
            if (window.gameEngine) {
                window.gameEngine.switchScene(sceneId);
            }
            showScreen('game');
        });
    });
    
    // 返回地图按钮
    document.getElementById('back-to-map').addEventListener('click', () => {
        showScreen('map-select');
    });
    
    // 查看结局按钮
    document.getElementById('map-select-ending').addEventListener('click', () => {
        showEnding();
    });
    
    // 打开文化手账
    document.getElementById('open-notebook').addEventListener('click', () => {
        showScreen('notebook');
    });
    
    // 关闭文化手账
    document.getElementById('close-notebook').addEventListener('click', () => {
        showScreen('game');
    });
    
    // 打开任务面板
    document.getElementById('open-tasks').addEventListener('click', () => {
        showScreen('tasks');
    });
    
    // 关闭任务面板
    document.getElementById('close-tasks').addEventListener('click', () => {
        showScreen('game');
    });
    
    // 打开提示界面
    document.getElementById('open-hints').addEventListener('click', () => {
        if (window.gameEngine) {
            window.gameEngine.showHint();
        }
    });
    
    // 重新开始按钮
    document.getElementById('restart-btn').addEventListener('click', () => {
        // 重置游戏状态
        GameState.collectedFragments = [];
        GameState.collectedClues = [];
        GameState.completedTasks = [];
        GameState.currentScene = 'cityGate';
        GameState.player.x = 600;
        GameState.player.y = 600;
        GameState.investigationCount = {
            cityGate: 0,
            bank: 0,
            escortAgency: 0,
            noodleShop: 0,
            courtyard: 0
        };
        GameState.investigatedObjects = [];
        GameState.talkedNPCs = [];
        GameState.hintUsage = {
            cityGate: 0,
            bank: 0,
            escortAgency: 0,
            noodleShop: 0,
            courtyard: 0
        };
        
        // 重置任务
        TASKS.forEach(task => {
            task.isCompleted = false;
            task.isActive = task.id === 'task1';
        });
        
        showScreen('start');
    });
}

// ========================================
// 游戏初始化
// ========================================
function initGame() {
    console.log('🏮 晋行谜城 - 游戏初始化...');
    
    initEventListeners();
    showScreen('start');
    
    console.log('✅ 游戏初始化完成！');
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);

console.log('🎉 Script.js 第四部分（UI函数、事件监听、初始化）加载完成！');
console.log('🏮 晋行谜城 - 深度升级版代码全部加载完成！');