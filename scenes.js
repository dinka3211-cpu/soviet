// ====== Все сцены игры ======
const SCENES = {
    intro: {
        bg: 'camp',
        music: 'day',
        speaker: 'Рассказчик',
        text: 'Автобус остановился у ворот пионерского лагеря «Заря». Ты вышел на пыльную дорогу, щурясь от яркого солнца. Пахло хвоей и свежескошенной травой. Позади — город, впереди — целое лето.',
        next: 'meet_alice'
    },
    meet_alice: {
        bg: 'forest',
        character: 'alice',
        speaker: '???',
        text: '— Эй, новенький! — рыжий вихрь выскочил из-за кустов. Девчонка с наглой улыбкой преградила тебе путь. — Ты чего тут стоишь? Заблудился, что ли?',
        choices: [
            { text: '— Вообще-то я ищу корпус. Поможешь?', effect: { alice: 2 }, next: 'alice_help' },
            { text: '— Не твоё дело.', effect: { alice: -1 }, next: 'alice_angry' },
            { text: '— Привет! Я новенький. А ты кто?', effect: { alice: 1 }, next: 'alice_help' }
        ]
    },
    alice_help: {
        bg: 'forest',
        character: 'alice',
        speaker: 'Алиса',
        text: '— Алиса, — она усмехнулась. — Ладно, пошли, покажу. Всё равно делать нечего.\n\nВы прошли через сосновую рощу. Алиса болтала без умолку — про лагерь, про вожатых, про то, кто здесь «нормальный», а кто «сноб».',
        achievement: 'meet_alice',
        next: 'meet_lena'
    },
    alice_angry: {
        bg: 'forest',
        character: 'alice',
        speaker: 'Алиса',
        text: '— Фу, какой грубый, — она закатила глаза и развернулась. — Ну и иди сам, как хочешь.\n\nОна скрылась за деревьями. Ты остался один.',
        next: 'meet_lena'
    },
    meet_lena: {
        bg: 'lake',
        music: 'romantic',
        character: 'lena',
        speaker: 'Рассказчик',
        text: 'Ты вышел к озеру. На старой скамейке сидела девушка с длинными тёмными волосами и книгой в руках. Она подняла на тебя застенчивый взгляд.',
        next: 'lena_talk'
    },
    lena_talk: {
        bg: 'lake',
        character: 'lena',
        speaker: 'Лена',
        text: '— Ой... ты меня напугал. Я Лена. Ты, наверное, новенький?',
        choices: [
            { text: '— Да. Что читаешь?', effect: { lena: 2 }, next: 'lena_book' },
            { text: '— Извини, что помешал.', effect: { lena: 1 }, next: 'lena_book' },
            { text: '— Тут везде так тихо, да?', effect: { lena: 1 }, next: 'lena_book' }
        ]
    },
    lena_book: {
        bg: 'lake',
        character: 'lena',
        speaker: 'Лена',
        text: '— «Мастер и Маргарита», — она показала обложку. — Перечитываю. У нас в лагере библиотека маленькая, но эту книгу я взяла с собой.\n\nОна улыбнулась — робко, но искренне. Солнце блеснуло на воде.',
        achievement: 'meet_lena',
        next: 'meet_slavya'
    },
    meet_slavya: {
        bg: 'camp',
        character: 'slavya',
        speaker: 'Славя',
        text: '— Привет! Ты новенький? Я Славя, помогу тебе с расписанием, — перед тобой стояла светловолосая девушка с тёплой улыбкой. — Если что-то нужно — обращайся.',
        choices: [
            { text: '— Спасибо, ты очень добрая.', effect: { slavya: 2 }, next: 'slavya_happy' },
            { text: '— Ладно, буду знать.', effect: { slavya: 1 }, next: 'slavya_happy' },
            { text: '— Я сам разберусь.', effect: { slavya: -1 }, next: 'slavya_sad' }
        ]
    },
    slavya_happy: {
        bg: 'camp',
        character: 'slavya',
        speaker: 'Славя',
        text: '— Ой, спасибо! — она смутилась. — У нас тут все свои, так что не стесняйся.\n\nВ её голосе было столько тепла, что ты невольно улыбнулся.',
        achievement: 'meet_slavya',
        next: 'meet_uliana'
    },
    slavya_sad: {
        bg: 'camp',
        character: 'slavya',
        speaker: 'Славя',
        text: '— Ну... хорошо. Если передумаешь — я в третьем корпусе.\n\nОна ушла, чуть поникнув. Кажется, ты был слишком резок.',
        next: 'meet_uliana'
    },
    meet_uliana: {
        bg: 'forest',
        character: 'uliana',
        speaker: 'Ульяна',
        text: '— ДЯДЯ, ДЯДЯ, СМОТРИ ЧТО У МЕНЯ ЕСТЬ! — маленькая девчонка с двумя хвостиками подбежала к тебе, держа в руках лягушку.\n\n— Она из озера! Хочешь потрогать?',
        choices: [
            { text: '— Вау, крутая! Давай посмотрю.', effect: { uliana: 3 }, next: 'uliana_fun' },
            { text: '— Эм... спасибо, не надо.', effect: { uliana: 0 }, next: 'uliana_pout' },
            { text: '— Отпусти её, ей больно.', effect: { uliana: 1, slavya: 1 }, next: 'uliana_fun' }
        ]
    },
    uliana_fun: {
        bg: 'forest',
        character: 'uliana',
        speaker: 'Ульяна',
        text: '— ЙЕЕЕЙ! Ты первый взрослый, кто не сказал «фу»! — она запрыгала вокруг тебя. — Мы будем друзьями! То есть... ты будешь моим другом!\n\nОна убежала, крикнув на прощание: «Увидимся на конкурсе!».',
        achievement: 'meet_uliana',
        next: 'day1_evening'
    },
    uliana_pout: {
        bg: 'forest',
        character: 'uliana',
        speaker: 'Ульяна',
        text: '— Ну и ладно! — она надулась и убежала, прижимая лягушку к груди.\n\nКажется, ты её обидел.',
        next: 'day1_evening'
    },
    day1_evening: {
        bg: 'night',
        music: 'night',
        character: null,
        speaker: 'Рассказчик',
        text: 'Вечер опустился на лагерь. В корпусе пахло деревом и старыми матрасами. Ты лежал на койке, глядя в потолок, и думал о том, что этот день изменил что-то в тебе.',
        onEnter: () => { state.day = 1; state.timeOfDay = 'evening'; },
        next: 'day2_morning'
    },
    day2_morning: {
        bg: 'camp',
        music: 'day',
        speaker: 'Рассказчик',
        text: 'Утро. Зарядка, завтрак, линейка. Вожатая объявила конкурс талантов через три дня. У тебя есть шанс проявить себя... или остаться в тени.',
        onEnter: () => { state.day = 2; state.timeOfDay = 'morning'; },
        choices: [
            { text: 'Подойти к Алисе и предложить номер', effect: { alice: 3 }, next: 'rehearsal_alice' },
            { text: 'Найти Лену и обсудить идеи', effect: { lena: 3 }, next: 'rehearsal_lena' },
            { text: 'Пойти к Ульяне — она точно что-то придумает', effect: { uliana: 3 }, next: 'rehearsal_uliana' },
            { text: 'Помочь Славе с подготовкой сцены', effect: { slavya: 3 }, next: 'rehearsal_slavya' },
            { text: 'Остаться в стороне', effect: {}, next: 'day3_alone' }
        ]
    },
    rehearsal_alice: {
        bg: 'camp',
        character: 'alice',
        speaker: 'Алиса',
        text: '— Ха! Хочешь со мной в паре? Ну попробуй, — она прищурилась. — Только если облажаешься, я тебя при всех высмею.\n\nВы репетировали до самого вечера. Алиса оказалась требовательной, но честной. И где-то под её колкостями пряталась улыбка.',
        achievement: 'rehearsal_done',
        next: 'day2_evening_alice'
    },
    rehearsal_lena: {
        bg: 'lake',
        music: 'romantic',
        character: 'lena',
        speaker: 'Лена',
        text: '— Стихи?.. Я... я могу почитать. Только не смейся, ладно?\n\nЕё голос дрожал, но когда она начала читать, всё вокруг будто замерло. Ты понял: эта девушка — глубже, чем кажется.',
        achievement: 'rehearsal_done',
        next: 'day2_evening_lena'
    },
    rehearsal_uliana: {
        bg: 'camp',
        character: 'uliana',
        speaker: 'Ульяна',
        text: '— Ура! Наконец-то кто-то не скучный! — она запрыгала на месте. — Давай сделаем что-нибудь такое, чтобы все ахнули!\n\nЕё энергия была заразительной. Вы придумали сценку, от которой вожатые схватятся за голову.',
        achievement: 'rehearsal_done',
        next: 'day2_evening_uliana'
    },
    rehearsal_slavya: {
        bg: 'camp',
        character: 'slavya',
        speaker: 'Славя',
        text: '— Ты правда поможешь? — её глаза засияли. — Обычно все отлынивают...\n\nВы вместе развешивали гирлянды, и Славя тихо напевала что-то из старого фильма. В такие моменты понимаешь, что счастье — в мелочах.',
        achievement: 'rehearsal_done',
        next: 'day2_evening_slavya'
    },
    day2_evening_alice: {
        bg: 'night',
        music: 'romantic',
        character: 'alice',
        speaker: 'Алиса',
        text: '— Слушай... — она вдруг стала серьёзной. — Ты нормальный. Я таких редко встречаю.\n\nОна быстро отвернулась и убежала, оставив тебя с бьющимся сердцем.',
        next: 'day3_morning'
    },
    day2_evening_lena: {
        bg: 'night',
        music: 'romantic',
        character: 'lena',
        speaker: 'Лена',
        text: '— Спасибо, что не смеялся... — тихо сказала она. — Мне с тобой спокойно. Как с книгой, только лучше.\n\nВы ещё долго сидели у озера, глядя на звёзды.',
        next: 'day3_morning'
    },
    day2_evening_uliana: {
        bg: 'night',
        character: 'uliana',
        speaker: 'Ульяна',
        text: '— Ты самый лучший! — она обняла тебя. — Давай завтра ещё что-нибудь придумаем?\n\nТы улыбнулся. В её мире всё было просто и искренне.',
        next: 'day3_morning'
    },
    day2_evening_slavya: {
        bg: 'night',
        music: 'romantic',
        character: 'slavya',
        speaker: 'Славя',
        text: '— Ты... хороший, — она смущённо улыбнулась. — Не как все. Я рада, что мы познакомились.\n\nОна задержала твою руку на мгновение дольше, чем нужно.',
        next: 'day3_morning'
    },
    day3_alone: {
        bg: 'night',
        speaker: 'Рассказчик',
        text: 'Ты провёл день в одиночестве, читая старый журнал в библиотеке. Иногда полезно просто побыть с собой.',
        next: 'day3_morning'
    },
    day3_morning: {
        bg: 'camp',
        music: 'day',
        speaker: 'Рассказчик',
        text: 'День конкурса. С самого утра в лагере суета: все готовятся, репетируют, спорят. Ты чувствуешь, что сегодня решится что-то важное.',
        onEnter: () => { state.day = 3; state.timeOfDay = 'day'; },
        next: 'day3_finale'
    },
    day3_finale: {
        bg: 'stage',
        music: 'romantic',
        speaker: 'Рассказчик',
        text: 'Настал вечер конкурса. Сцена, гирлянды, зрители. Твоё сердце колотится. Пора выходить.\n\nТы поднимаешься по ступенькам, свет слепит глаза...',
        next: 'day4_morning'
    },
    day4_morning: {
        bg: 'camp',
        music: 'day',
        speaker: 'Рассказчик',
        text: 'После конкурса прошёл день, потом ещё один. Ваша дружба окрепла. Но приближается день отъезда...',
        onEnter: () => { state.day = 4; },
        choices: [
            { text: 'Поговорить с Алисой', need: { alice: 3 }, next: 'finale_alice' },
            { text: 'Поговорить с Леной', need: { lena: 3 }, next: 'finale_lena' },
            { text: 'Поговорить с Ульяной', need: { uliana: 3 }, next: 'finale_uliana' },
            { text: 'Поговорить со Славей', need: { slavya: 3 }, next: 'finale_slavya' },
            { text: 'Прогуляться одному', effect: {}, next: 'ending_check' }
        ]
    },
    finale_alice: {
        bg: 'night',
        music: 'romantic',
        character: 'alice',
        speaker: 'Алиса',
        text: '— Я не умею прощаться, — тихо сказала она. — Поэтому просто запомни: ты был лучшим летом в моей жизни.\n\nОна схватила тебя за руку и потащила к озеру. Вы сидели на причале до рассвета.',
        achievement: 'romance_alice',
        next: 'ending_check'
    },
    finale_lena: {
        bg: 'night',
        music: 'romantic',
        character: 'lena',
        speaker: 'Лена',
        text: '— У меня для тебя подарок, — она протянула старую книгу с закладкой. — Это моя любимая. Я хочу, чтобы она была у тебя.\n\nНа последней странице было написано её номером телефона.',
        achievement: 'romance_lena',
        next: 'ending_check'
    },
    finale_uliana: {
        bg: 'night',
        character: 'uliana',
        speaker: 'Ульяна',
        text: '— Ты приедешь следующим летом? — она смотрела серьёзно, без обычной улыбки. — Обещай!\n\nТы не мог ей отказать. И не хотел.',
        achievement: 'romance_uliana',
        next: 'ending_check'
    },
    finale_slavya: {
        bg: 'night',
        music: 'romantic',
        character: 'slavya',
        speaker: 'Славя',
        text: '— Я испекла тебе пирог на дорогу, — она смущённо улыбнулась. — И... вот.\n\nОна вложила в твою ладонь маленькую записку. «Я буду ждать».',
        achievement: 'romance_slavya',
        next: 'ending_check'
    },
    // Премиум-главы
    chapter6: {
        bg: 'night',
        music: 'romantic',
        speaker: 'Рассказчик',
        text: '🌙 ПРЕМИУМ-ГЛАВА\n\nНочь перед отъездом. Ты не можешь уснуть и выходишь на причал. Там, у самой воды, стоит Она. Вы смотрите на луну и молчите — слова больше не нужны.',
        next: 'chapter6_choice'
    },
    chapter6_choice: {
        bg: 'night',
        music: 'romantic',
        speaker: 'Она',
        text: '— Знаешь... я не хочу, чтобы это лето заканчивалось.',
        choices: [
            { text: '— Тогда давай его не заканчивать.', effect: { alice: 5, lena: 5, slavya: 5, uliana: 5 }, next: 'ending_check' },
            { text: '— Всё хорошее когда-нибудь заканчивается.', next: 'ending_check' }
        ]
    },
    chapter7: {
        bg: 'camp',
        music: 'day',
        speaker: 'Рассказчик',
        text: '☀️ ПРЕМИУМ-ГЛАВА\n\nПрошёл год. Ты снова стоишь у ворот лагеря «Заря». Сердце стучит — а вдруг её здесь уже нет? И тут ты слышишь знакомый голос...',
        next: 'ending_check'
    }
};
