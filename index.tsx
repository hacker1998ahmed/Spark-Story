/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Modality, Type, Part } from '@google/genai';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { marked } from 'https://esm.sh/marked@13.0.0';

// --- REGION: TYPE DEFINITIONS ---
interface Story {
    id: number;
    title: string;
    prompt: string;
    text: string;
    type: string;
    imageUrl?: string;
    timestamp: string;
}
// --- ENDREGION: TYPE DEFINITIONS ---

// --- REGION: DOM ELEMENT SELECTION ---
const DOM = {
    // Story Creator Page
    promptForm: document.getElementById('prompt-form') as HTMLFormElement,
    promptInput: document.getElementById('prompt-input') as HTMLTextAreaElement,
    generateBtn: document.getElementById('generate-btn') as HTMLButtonElement,
    genreSelect: document.getElementById('genre-select') as HTMLSelectElement,
    styleSelect: document.getElementById('style-select') as HTMLSelectElement,
    scheduleCheckbox: document.getElementById('schedule-checkbox') as HTMLInputElement,
    scheduleOptions: document.getElementById('schedule-options') as HTMLElement,
    resultCard: document.getElementById('result-card') as HTMLElement,
    storyContainer: document.getElementById('story-container') as HTMLElement,
    storyImageContainer: document.getElementById('story-image-container') as HTMLElement,
    storyImage: document.getElementById('story-image') as HTMLImageElement,
    // FIX: Cannot reference `storyImageContainer` during `DOM` object initialization. Selecting from `document` instead.
    imageLoader: document.querySelector('#story-image-container .image-loader') as HTMLImageElement,
    actionToolbar: document.getElementById('action-toolbar') as HTMLElement,
    storyTypeChooser: document.querySelector('.story-type-chooser') as HTMLFieldSetElement,
    extendStoryForm: document.getElementById('extend-story-form') as HTMLFormElement,
    extendPromptInput: document.getElementById('extend-prompt-input') as HTMLTextAreaElement,
    extendBtn: document.getElementById('extend-btn') as HTMLButtonElement,
    inspirationBtn: document.getElementById('inspiration-btn') as HTMLButtonElement,

    // Image Studio Page
    textToImageForm: document.getElementById('text-to-image-form') as HTMLFormElement,
    t2iPromptInput: document.getElementById('t2i-prompt-input') as HTMLTextAreaElement,
    t2iGenerateBtn: document.getElementById('t2i-generate-btn') as HTMLButtonElement,
    t2iResultContainer: document.getElementById('t2i-result-container') as HTMLElement,
    // FIX: Cannot reference `t2iResultContainer` during `DOM` object initialization. Selecting from `document` instead.
    t2iImageLoader: document.querySelector('#t2i-result-container .image-loader') as HTMLElement,
    t2iResultImage: document.getElementById('t2i-result-image') as HTMLImageElement,
    imageToVideoForm: document.getElementById('image-to-video-form') as HTMLFormElement,
    i2vFileInput: document.getElementById('i2v-file-input') as HTMLInputElement,
    i2vPromptInput: document.getElementById('i2v-prompt-input') as HTMLTextAreaElement,
    i2vGenerateBtn: document.getElementById('i2v-generate-btn') as HTMLButtonElement,
    i2vResultContainer: document.getElementById('i2v-result-container') as HTMLElement,
    // FIX: Cannot reference `i2vResultContainer` during `DOM` object initialization. Selecting from `document` instead.
    i2vLoaderContainer: document.querySelector('#i2v-result-container .video-loader-container') as HTMLElement,
    i2vResultVideo: document.getElementById('i2v-result-video') as HTMLVideoElement,
    videoStatusMessage: document.getElementById('video-status-message') as HTMLParagraphElement,
    fileNameSpan: document.getElementById('file-name-span') as HTMLSpanElement,

    // Image Editor Page
    imageEditorForm: document.getElementById('image-editor-form') as HTMLFormElement,
    imageEditorFileInput: document.getElementById('image-editor-file-input') as HTMLInputElement,
    imageEditorFileName: document.getElementById('image-editor-file-name') as HTMLSpanElement,
    imageEditorPreviewContainer: document.getElementById('image-editor-preview-container') as HTMLElement,
    imageEditorPreviewImage: document.getElementById('image-editor-preview-image') as HTMLImageElement,
    imageEditorPrompt: document.getElementById('image-editor-prompt') as HTMLTextAreaElement,
    imageEditorResultCard: document.getElementById('image-editor-result-card') as HTMLElement,
    // FIX: Cannot reference `imageEditorResultCard` during `DOM` object initialization. Selecting from `document` instead.
    imageEditorResultLoader: document.querySelector('#image-editor-result-card .image-loader') as HTMLElement,
    imageEditorResultImage: document.getElementById('image-editor-result-image') as HTMLImageElement,
    maskCanvas: document.getElementById('image-editor-mask-canvas') as HTMLCanvasElement,
    maskControls: document.getElementById('mask-controls') as HTMLElement,
    brushSizeSlider: document.getElementById('brush-size') as HTMLInputElement,
    maskUndoBtn: document.getElementById('mask-undo-btn') as HTMLButtonElement,
    maskClearBtn: document.getElementById('mask-clear-btn') as HTMLButtonElement,

    // Comic Creator Page
    comicCreatorForm: document.getElementById('comic-creator-form') as HTMLFormElement,
    comicCreatorResultCard: document.getElementById('comic-creator-result-card') as HTMLElement,
    // FIX: Cannot reference `comicCreatorResultCard` during `DOM` object initialization. Selecting from `document` instead.
    comicCreatorResultLoader: document.querySelector('#comic-creator-result-card .image-loader') as HTMLElement,
    comicCreatorResultImage: document.getElementById('comic-creator-result-image') as HTMLImageElement,

    // Story to Comic Page
    storyToComicForm: document.getElementById('story-to-comic-form') as HTMLFormElement,
    storyToComicPrompt: document.getElementById('story-to-comic-prompt') as HTMLTextAreaElement,
    storyToComicResultCard: document.getElementById('story-to-comic-result-card') as HTMLElement,
    storyToComicStatus: document.getElementById('story-to-comic-status') as HTMLParagraphElement,
    comicResultGrid: document.getElementById('comic-result-grid') as HTMLElement,

    // Logo Generator
    logoGeneratorForm: document.getElementById('logo-generator-form') as HTMLFormElement,
    logoResultContainer: document.getElementById('logo-result-container') as HTMLElement,
    // FIX: Cannot reference `logoResultContainer` during `DOM` object initialization. Selecting from `document` instead.
    logoResultLoader: document.querySelector('#logo-result-container .image-loader') as HTMLElement,
    logoResultImage: document.getElementById('logo-result-image') as HTMLImageElement,

    // Meme Generator
    memeFileInput: document.getElementById('meme-file-input') as HTMLInputElement,
    memeFileName: document.getElementById('meme-file-name') as HTMLSpanElement,
    memeEditorContainer: document.getElementById('meme-editor-container') as HTMLElement,
    memeCanvas: document.getElementById('meme-canvas') as HTMLCanvasElement,
    memeTopTextInput: document.getElementById('meme-top-text') as HTMLInputElement,
    memeBottomTextInput: document.getElementById('meme-bottom-text') as HTMLInputElement,
    memeSuggestBtn: document.getElementById('meme-suggest-btn') as HTMLButtonElement,
    memeDownloadBtn: document.getElementById('meme-download-btn') as HTMLButtonElement,

    // Speech to Text
    recordBtn: document.getElementById('record-btn') as HTMLButtonElement,
    recordingStatus: document.getElementById('recording-status') as HTMLParagraphElement,
    speechResultCard: document.querySelector('#speech-to-text-page .generic-result-card') as HTMLElement,
    speechResultContainer: document.getElementById('speech-result-container') as HTMLElement,

    // Doc Q&A
    docQaForm: document.getElementById('doc-qa-form') as HTMLFormElement,
    docQaDocInput: document.getElementById('doc-qa-doc-input') as HTMLTextAreaElement,
    docQaQuestionInput: document.getElementById('doc-qa-question-input') as HTMLTextAreaElement,

    // Background Remover
    bgRemoverForm: document.getElementById('bg-remover-form') as HTMLFormElement,
    bgRemoverFileInput: document.getElementById('bg-remover-file-input') as HTMLInputElement,
    bgRemoverFileName: document.getElementById('bg-remover-file-name') as HTMLSpanElement,
    bgRemoverPreviewContainer: document.getElementById('bg-remover-preview-container') as HTMLElement,
    bgRemoverPreviewImage: document.getElementById('bg-remover-preview-image') as HTMLImageElement,
    bgRemoverResultCard: document.getElementById('bg-remover-result-card') as HTMLElement,
    // FIX: Cannot reference `bgRemoverResultCard` during `DOM` object initialization. Selecting from `document` instead.
    bgRemoverResultLoader: document.querySelector('#bg-remover-result-card .image-loader') as HTMLElement,
    bgRemoverResultImage: document.getElementById('bg-remover-result-image') as HTMLImageElement,

    // OCR
    ocrForm: document.getElementById('ocr-form') as HTMLFormElement,
    ocrFileInput: document.getElementById('ocr-file-input') as HTMLInputElement,
    ocrFileName: document.getElementById('ocr-file-name') as HTMLSpanElement,
    ocrPreviewContainer: document.getElementById('ocr-preview-container') as HTMLElement,
    ocrPreviewImage: document.getElementById('ocr-preview-image') as HTMLImageElement,
    ocrResultCard: document.getElementById('ocr-result-card') as HTMLElement,
    ocrResultContainer: document.getElementById('ocr-result-container') as HTMLElement,
    ocrDownloadLink: document.getElementById('ocr-download-link') as HTMLAnchorElement,

    // History Page
    historyListContainer: document.getElementById('history-list') as HTMLElement,
    historySearchInput: document.getElementById('history-search-input') as HTMLInputElement,

    // Action Buttons
    copyBtn: document.getElementById('copy-btn') as HTMLButtonElement,
    listenBtn: document.getElementById('listen-btn') as HTMLButtonElement,
    proofreadBtn: document.getElementById('proofread-btn') as HTMLButtonElement,
    summarizeBtn: document.getElementById('summarize-btn') as HTMLButtonElement,
    printBtn: document.getElementById('print-btn') as HTMLButtonElement,
    pdfBtn: document.getElementById('pdf-btn') as HTMLButtonElement,
    wordBtn: document.getElementById('word-btn') as HTMLButtonElement,
    txtBtn: document.getElementById('txt-btn') as HTMLButtonElement,

    // Navigation & Global
    toolCards: document.querySelectorAll('.tool-card'),
    navButtons: document.querySelectorAll('.nav-btn'),
    pages: document.querySelectorAll('.page'),
    tooltip: document.getElementById('tooltip') as HTMLElement,

    // Settings
    themeSwitcher: document.getElementById('theme-switcher'),
    fontSizeSwitcher: document.getElementById('font-size-switcher'),
    languageSwitcher: document.getElementById('language-switcher'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
};
// --- ENDREGION: DOM ELEMENT SELECTION ---

// --- REGION: STATE MANAGEMENT ---
interface AppState {
    ai: GoogleGenAI | null;
    activeStoryId: number | null;
    savedStories: Story[];
    currentLang: 'ar' | 'en';
    currentUtterance: SpeechSynthesisUtterance | null;
    mediaRecorder: MediaRecorder | null;
    audioChunks: Blob[];
}

const state: AppState = {
    ai: null,
    activeStoryId: null,
    savedStories: [],
    currentLang: 'ar',
    currentUtterance: null,
    mediaRecorder: null,
    audioChunks: [],
};
// --- ENDREGION: STATE MANAGEMENT ---

// --- REGION: CONSTANTS (Translations, System Instructions) ---
const translations = {
    ar: {
        // App
        'app.title': 'شرارة قصة',
        'appName': 'شرارة قصة',
        // Common
        'common.submit': 'إرسال',
        'common.download': 'تحميل',
        // Nav
        'nav.home': 'الرئيسية',
        'nav.history': 'السجل',
        'nav.settings': 'الإعدادات',
        // Home
        'home.title': 'استوديو الإبداع',
        'home.subtitle': 'مجموعة متكاملة من أدوات الذكاء الاصطناعي بين يديك.',
        // Story Creator
        'storyCreator.title': 'منشئ القصص',
        'storyCreator.description': 'حوّل أفكارك إلى قصص نصية، مصورة، أو مخططات روايات.',
        'storyCreator.outputType': 'اختر نوع الإخراج',
        'storyCreator.typeShort': 'قصة قصيرة',
        'storyCreator.typeIllustrated': 'قصة مصورة',
        'storyCreator.typeNovel': 'مخطط رواية',
        'storyCreator.details': 'أضف تفاصيل (اختياري)',
        'storyCreator.genre': 'النوع الأدبي',
        'storyCreator.genre.any': 'أي نوع',
        'storyCreator.genre.sciFi': 'خيال علمي',
        'storyCreator.genre.fantasy': 'فانتازيا',
        'storyCreator.genre.horror': 'رعب',
        'storyCreator.genre.comedy': 'كوميديا',
        'storyCreator.genre.drama': 'دراما',
        'storyCreator.genre.adventure': 'مغامرة',
        'storyCreator.genre.historical': 'تاريخي',
        'storyCreator.style': 'أسلوب الكتابة',
        'storyCreator.style.any': 'أي أسلوب',
        'storyCreator.style.simple': 'بسيط وواضح',
        'storyCreator.style.descriptive': 'وصفي ومفصل',
        'storyCreator.style.humorous': 'فكاهي وساخر',
        'storyCreator.style.poetic': 'شاعري',
        'storyCreator.style.mysterious': 'غامض ومثير',
        'storyCreator.promptLabel': 'اكتب فكرة القصة هنا...',
        'storyCreator.promptPlaceholder': 'مثال: رائد فضاء يكتشف كوكباً مصنوعاً بالكامل من الكريستال...',
        'storyCreator.generateButton': 'ابدأ الإنشاء',
        'storyCreator.inspirationTitle': 'هل تحتاج إلى إلهام؟',
        'storyCreator.inspirationText': 'احصل على فكرة قصة عشوائية لتبدأ بها.',
        'storyCreator.inspirationButton': 'أعطني فكرة!',
        'storyCreator.extendPlaceholder': 'اكتب ما تريد أن يحدث بعد ذلك... مثال: "اجعل البطل يكتشف سراً داخل الكريستال"',
        'storyCreator.extendButton': 'تطوير القصة',
        'storyCreator.scheduleTitle': 'جدولة الإنشاء (قريباً)',
        'storyCreator.scheduleLabel': 'جدولة هذه القصة لوقت لاحق',
        'storyCreator.scheduleTimeLabel': 'اختر التاريخ والوقت',
        'storyCreator.scheduleNote': 'ملاحظة: هذه الميزة تجريبية وقد لا تعمل بدقة.',
        // Image Studio
        'imageStudio.title': 'استوديو الصور والفيديو',
        'imageStudio.description': 'أنشئ صوراً فنية من النصوص، أو حوّل صورك إلى فيديوهات.',
        'imageStudio.t2iTitle': 'تحويل النص إلى صورة',
        'imageStudio.t2iPlaceholder': 'مثال: قط يرتدي قبعة ساحر ويقرأ كتاباً قديماً، بأسلوب الرسم الزيتي',
        'imageStudio.t2iButton': 'إنشاء صورة',
        'imageStudio.i2vTitle': 'تحويل الصورة إلى فيديو (قريباً)',
        'imageStudio.i2vFile': 'اختر ملف الصورة',
        'imageStudio.i2vPlaceholder': 'صف الحركة التي تريد إضافتها للصورة...',
        'imageStudio.i2vButton': 'إنشاء فيديو',
        'imageStudio.i2vStatus': 'جاري إنشاء الفيديو، قد يستغرق الأمر بضع دقائق...',
        // AI Chat
        'aiChat.title': 'مساعد ذكي',
        'aiChat.description': 'اطرح أي سؤال أو دردش حول أي موضوع للحصول على إجابات.',
        'aiChat.placeholder': 'مثال: ما هي عاصمة أستراليا؟ أو اشرح لي مفهوم الثقب الأسود ببساطة.',
        // Image Editor
        'imageEditor.title': 'محرر الصور',
        'imageEditor.description': 'عدّل صورك بالذكاء الاصطناعي. اطلب تغييرات مثل "أضف قبعة".',
        'imageEditor.selectFile': 'اختر صورة للتعديل',
        'imageEditor.placeholder': 'اكتب التعديل الذي تريده... مثال: "أضف نظارة شمسية على وجه الشخص" أو "غير لون السماء إلى برتقالي وقت الغروب".',
        'imageEditor.button': 'تعديل الصورة',
        'imageEditor.resultTitle': 'الصورة المعدلة',
         // Comic Creator
        'comicCreator.title': 'مُنشئ الكوميكس',
        'comicCreator.description': 'حوّل وصفك النصي إلى لوحة فنية بأسلوب المانجا أو الويبتون.',
        'comicCreator.placeholder': 'صف المشهد الذي تريده... مثال: "شخصية محارب وحيد يقف على قمة جبل وقت الغروب، ينظر إلى قلعة بعيدة، رياح قوية تحرك عباءته"',
        'comicCreator.button': 'إنشاء اللوحة',
        // Story to Comic
        'storyToComic.title': 'تحويل القصة إلى كوميكس',
        'storyToComic.description': 'ألصق قصة قصيرة وسيقوم الذكاء الاصطناعي بتحويلها لقصة مصورة.',
        'storyToComic.placeholder': 'ألصق قصتك القصيرة هنا...',
        'storyToComic.button': 'حوّل إلى كوميكس',
        // Generic Tools
        'emailWriter.title': 'كاتب البريد الإلكتروني',
        'emailWriter.description': 'اكتب رسائل بريد إلكتروني احترافية ومقنعة في ثوانٍ.',
        'emailWriter.placeholder': 'اكتب الغرض من البريد... مثال: "اكتب بريداً لطلب إجازة من مديري لمدة ٣ أيام الأسبوع القادم بسبب ظرف عائلي"',
        'emailWriter.button': 'إنشاء البريد',
        'recipeGenerator.title': 'مولد الوصفات',
        'recipeGenerator.description': 'أدخل المكونات المتوفرة لديك واحصل على وصفة مبتكرة.',
        'recipeGenerator.placeholder': 'اكتب المكونات المتوفرة لديك... مثال: "دجاج، أرز، طماطم، بصل"',
        'recipeGenerator.button': 'ابحث عن وصفة',
        'poemGenerator.title': 'مولد القصائد',
        'poemGenerator.description': 'حوّل أفكارك ومشاعرك إلى قصائد شعرية جميلة.',
        'poemGenerator.placeholder': 'اكتب موضوع القصيدة... مثال: "اكتب قصيدة عن جمال شروق الشمس في الصحراء"',
        'poemGenerator.button': 'اكتب قصيدة',
        'songWriter.title': 'كاتب الأغاني',
        'songWriter.description': 'اكتب كلمات أغانٍ كاملة لأي نوع موسيقي.',
        'songWriter.placeholder': 'اكتب فكرة الأغنية ونوعها الموسيقي... مثال: "اكتب كلمات أغنية بوب حماسية عن السفر واكتشاف أماكن جديدة"',
        'songWriter.button': 'اكتب أغنية',
        'codeAssistant.title': 'مساعد المبرمجين',
        'codeAssistant.description': 'مساعدك الذكي لكتابة، شرح، وإصلاح الأكواد البرمجية.',
        'codeAssistant.placeholder': 'اكتب سؤالك البرمجي... مثال: "اكتب دالة بلغة Python لحساب مضروب عدد ما"',
        'codeAssistant.button': 'اطلب مساعدة',
        'tripPlanner.title': 'مخطط الرحلات',
        'tripPlanner.description': 'خطط لرحلتك القادمة مع جدول يومي مفصل.',
        'tripPlanner.placeholder': 'اكتب وجهتك ومدة الرحلة... مثال: "خطط لرحلة إلى اليابان لمدة ٧ أيام"',
        'tripPlanner.button': 'خطط رحلتي',
        'workoutExpert.title': 'خبير التمارين',
        'workoutExpert.description': 'احصل على خطة تمارين رياضية مخصصة لأهدافك.',
        'workoutExpert.placeholder': 'اكتب هدفك ومستواك... مثال: "خطة تمارين للمبتدئين في المنزل لإنقاص الوزن ٣ أيام في الأسبوع"',
        'workoutExpert.button': 'صمم خطتي',
        'resumeAssistant.title': 'مساعد السيرة الذاتية',
        'resumeAssistant.description': 'احصل على مساعدة لتحسين سيرتك الذاتية وزيادة فرصك.',
        'resumeAssistant.placeholder': 'ألصق سيرتك الذاتية هنا واطلب مراجعتها...',
        'resumeAssistant.button': 'راجع سيرتي',
        'adWriter.title': 'كاتب الإعلانات',
        'adWriter.description': 'اكتب نصوصاً إعلانية جذابة ومقنعة لمنتجاتك.',
        'adWriter.placeholder': 'صف منتجك... مثال: "سماعات لاسلكية جديدة بعمر بطارية طويل وجودة صوت عالية"',
        'adWriter.button': 'اكتب إعلان',
        'socialPost.title': 'مولد منشورات السوشيال',
        'socialPost.description': 'أنشئ منشورات تفاعلية وجذابة لوسائل التواصل الاجتماعي.',
        'socialPost.placeholder': 'اكتب موضوع المنشور... مثال: "اكتب منشوراً على انستغرام عن أهمية شرب الماء"',
        'socialPost.button': 'أنشئ منشور',
        'logoGenerator.title': 'مُنشئ الشعارات',
        'logoGenerator.description': 'حوّل فكرة علامتك التجارية إلى شعار بسيط وأنيق.',
        'logoGenerator.placeholder': 'صف علامتك التجارية... مثال: "شعار لمقهى اسمه صباح، يدمج بين حبة البن وشمس مشرقة"',
        'logoGenerator.button': 'صمم الشعار',
        'memeGenerator.title': 'صانع الميمز',
        'memeGenerator.description': 'اصنع الميم الخاص بك. ارفع صورة، أضف نصاً، أو اطلب اقتراحاً.',
        'memeGenerator.selectFile': 'اختر صورة الميم',
        'memeGenerator.topText': 'النص العلوي',
        'memeGenerator.bottomText': 'النص السفلي',
        'memeGenerator.suggestButton': 'اقترح نصاً',
        'memeGenerator.downloadButton': 'تنزيل الميم',
        'speechToText.title': 'تحويل الكلام إلى نص',
        'speechToText.description': 'تحدث وسيقوم الذكاء الاصطناعي بتحويل صوتك إلى نص مكتوب.',
        'speechToText.startRecording': 'ابدأ التسجيل',
        'speechToText.stopRecording': 'إيقاف التسجيل',
        'speechToText.statusIdle': 'اضغط على الزر لبدء التسجيل الصوتي.',
        'speechToText.statusRecording': 'جاري التسجيل... تحدث الآن.',
        'speechToText.statusProcessing': 'جاري المعالجة...',
        'docQA.title': 'سؤال وجواب للمستندات',
        'docQA.description': 'ألصق نصاً أو وثيقة واطرح أسئلة حول محتواها.',
        'docQA.docPlaceholder': 'ألصق النص أو المستند هنا...',
        'docQA.questionPlaceholder': 'اطرح سؤالك عن المستند هنا...',
        'docQA.button': 'اسأل',
        'bgRemover.title': 'مزيل الخلفية',
        'bgRemover.description': 'أزل خلفية أي صورة بدقة عالية للحصول على صورة شفافة.',
        'bgRemover.selectFile': 'اختر صورة',
        'bgRemover.button': 'إزالة الخلفية',
        'bgRemover.resultTitle': 'الصورة النهائية',
        'ocr.title': 'قارئ النصوص من الصور',
        'ocr.description': 'ارفع صورة تحتوي على نص واستخرج الكتابة منها بدقة.',
        'ocr.selectFile': 'اختر صورة تحتوي على نص',
        'ocr.resultTitle': 'النص المستخرج',
        'videoScript.title': 'كاتب سيناريو الفيديو',
        'videoScript.description': 'اكتب سيناريو (سكريبت) كاملاً لمقطع الفيديو القادم.',
        'videoScript.placeholder': 'اكتب موضوع الفيديو... مثال: "فيديو عن أفضل 5 وجهات سياحية في مصر"',
        'videoScript.button': 'اكتب السيناريو',
        'rephrase.title': 'إعادة صياغة النصوص',
        'rephrase.description': 'ألصق أي نص للحصول على نسخة جديدة بكلمات مختلفة.',
        'rephrase.placeholder': 'ألصق النص هنا...',
        'rephrase.button': 'أعد الصياغة',
        'productDescription.title': 'كاتب وصف المنتجات',
        'productDescription.description': 'مثالي للمتاجر الإلكترونية لكتابة وصف جذاب للمنتجات.',
        'productDescription.placeholder': 'اكتب اسم المنتج ومواصفاته... مثال: "ساعة ذكية، شاشة AMOLED، مقاومة للماء، بطارية تدوم ٧ أيام"',
        'productDescription.button': 'اكتب الوصف',
        'coverLetter.title': 'كاتب خطاب التغطية',
        'coverLetter.description': 'اكتب خطاب تقديم احترافي ومقنع للوظائف.',
        'coverLetter.placeholder': 'اكتب المسمى الوظيفي وخبراتك الرئيسية... مثال: "مطور واجهات أمامية بخبرة ٣ سنوات في React و TypeScript"',
        'coverLetter.button': 'اكتب الخطاب',
        'brainstorm.title': 'مساعد العصف الذهني',
        'brainstorm.description': 'احصل على أفكار إبداعية وغير تقليدية حول أي موضوع.',
        'brainstorm.placeholder': 'اكتب الموضوع الذي تريد أفكاراً حوله... مثال: "أفكار لمشاريع صغيرة عبر الإنترنت"',
        'brainstorm.button': 'توليد أفكار',
        'jokeGenerator.title': 'مولد النكت',
        'jokeGenerator.description': 'اطلب نكتة عن أي موضوع للحصول على جرعة من الضحك.',
        'jokeGenerator.placeholder': 'اكتب موضوع النكتة... مثال: "نكتة عن المبرمجين"',
        'jokeGenerator.button': 'أخبرني نكتة',
        'dreamInterpreter.title': 'مفسر الأحلام',
        'dreamInterpreter.description': 'أدخل حلمك واحصل على تفسير شيق ومحتمل لمعانيه.',
        'dreamInterpreter.placeholder': 'صف حلمك بالتفصيل...',
        'dreamInterpreter.button': 'فسّر الحلم',
        'nameGenerator.title': 'مولد الأسماء',
        'nameGenerator.description': 'لأسماء الشخصيات، العلامات التجارية، أو أي شيء آخر.',
        'nameGenerator.placeholder': 'صف ما تريد اسماً له... مثال: "اسم لمتجر إلكتروني يبيع منتجات عضوية"',
        'nameGenerator.button': 'توليد أسماء',
        'interviewQuestions.title': 'مولد أسئلة المقابلات',
        'interviewQuestions.description': 'لمديري التوظيف: قم بإعداد أسئلة فعالة للمرشحين.',
        'interviewQuestions.placeholder': 'اكتب المسمى الوظيفي... مثال: "مدير تسويق رقمي"',
        'interviewQuestions.button': 'توليد أسئلة',
        'swot.title': 'تحليل SWOT',
        'swot.description': 'تحليل استراتيجي (قوة، ضعف، فرص، تهديدات) لأي مشروع.',
        'swot.placeholder': 'صف المشروع أو الشركة... مثال: "تحليل SWOT لتطبيق جديد لتوصيل الطلبات"',
        'swot.button': 'حلل الآن',
        'videoIdea.title': 'مولد أفكار الفيديوهات',
        'videoIdea.description': 'احصل على أفكار فيديوهات مبتكرة لقناتك على يوتيوب.',
        'videoIdea.placeholder': 'صف قناتك... مثال: "قناة طبخ تركز على الوصفات السريعة والصحية"',
        'videoIdea.button': 'توليد أفكار',
        'translator.title': 'المترجم',
        'translator.description': 'ترجم النصوص بين اللغات المختلفة بدقة وسلاسة.',
        'translator.placeholder': 'اكتب النص المراد ترجمته... مثال: "ترجم إلى الإنجليزية: صباح الخير"',
        'translator.button': 'ترجم',
        'formatConverter.title': 'محول الصيغ',
        'formatConverter.description': 'حوّل النص من قائمة نقاط إلى فقرة، أو العكس، وغيره.',
        'formatConverter.placeholder': 'ألصق النص واطلب التحويل... مثال: "حوّل هذه النقاط إلى فقرة: ..."',
        'formatConverter.button': 'تحويل',
        'meetingSummarizer.title': 'ملخص الاجتماعات',
        'meetingSummarizer.description': 'لخص محاضر الاجتماعات الطويلة في نقاط موجزة وواضحة.',
        'meetingSummarizer.placeholder': 'ألصق محضر الاجتماع هنا...',
        'meetingSummarizer.button': 'لخص',
        'worldBuilder.title': 'باني العوالم',
        'worldBuilder.description': 'ابنِ عوالم خيالية متكاملة لقصصك وألعابك.',
        'worldBuilder.placeholder': 'اكتب الفكرة الرئيسية للعالم... مثال: "عالم تسكنه كائنات مصنوعة من الزجاج وتعيش في غابات بلورية"',
        'worldBuilder.button': 'ابنِ العالم',
        'characterCreator.title': 'صانع الشخصيات',
        'characterCreator.description': 'اصنع شخصيات عميقة ومفصلة لقصصك ورواياتك.',
        'characterCreator.placeholder': 'اكتب الفكرة الرئيسية للشخصية... مثال: "قرصان فضائي يبحث عن كنز أسطوري لعلاج عائلته"',
        'characterCreator.button': 'اصنع الشخصية',
        'businessPlan.title': 'كاتب خطط العمل',
        'businessPlan.description': 'اكتب خطط عمل احترافية ومفصلة لمشروعك.',
        'businessPlan.placeholder': 'اكتب فكرة مشروعك والقسم الذي تريده... مثال: "مشروع مقهى متنقل، اكتب لي قسم تحليل السوق"',
        'businessPlan.button': 'اكتب الخطة',
        // History
        'history.title': 'سجل الأعمال',
        'history.description': 'تصفح، شارك، أو احذف القصص التي قمت بإنشائها سابقاً.',
        'history.searchPlaceholder': 'ابحث في السجل...',
        'history.empty': 'لا توجد قصص محفوظة بعد. ابدأ بإنشاء قصة جديدة!',
        'history.view': 'عرض',
        'history.delete': 'حذف',
        'history.cleared': 'تم مسح السجل بنجاح.',
        // Settings
        'settings.title': 'الإعدادات',
        'settings.description': 'تحكم في مظهر التطبيق وسلوكه.',
        'settings.appearance': 'المظهر',
        'settings.theme': 'المظهر العام',
        'settings.theme.dark': 'داكن',
        'settings.theme.light': 'فاتح',
        'settings.fontSize': 'حجم خط القصة',
        'settings.fontSize.small': 'صغير',
        'settings.fontSize.medium': 'متوسط',
        'settings.fontSize.large': 'كبير',
        'settings.language': 'اللغة',
        'settings.language.ar': 'العربية',
        'settings.language.en': 'English',
        'settings.data': 'البيانات',
        'settings.history': 'سجل الأعمال',
        'settings.clearHistory': 'مسح السجل بالكامل',
        'settings.clearHistoryWarning': 'سيؤدي هذا إلى حذف جميع القصص التي أنشأتها بشكل دائم.',
        'settings.clearHistoryConfirm': 'هل أنت متأكد أنك تريد حذف كل السجل؟ لا يمكن التراجع عن هذا الإجراء.',
        'settings.about.title': 'حول التطبيق',
        'settings.about.appDescription': 'هذا التطبيق هو استوديو إبداعي متكامل مدعوم بنماذج الذكاء الاصطناعي المتقدمة من Google Gemini لمساعدتك على تحويل أفكارك إلى واقع.',
        'settings.about.appFeatures': 'تم تصميمه ليكون سريعاً، فعالاً، وسهل الاستخدام، مع مجموعة واسعة من الأدوات التي تلبي احتياجات المبدعين والكتاب والمسوقين والمطورين.',
        'settings.about.developerInfo': 'معلومات المطور',
        'settings.about.devNameLabel': 'الاسم:',
        'settings.about.devName': 'احمد مصطفي ابراهيم',
        'settings.about.devCompanyLabel': 'باسم:',
        'settings.about.devCompany': 'المحترف للاستشارات الضريبية والقانونية',
        'settings.about.devPhoneLabel': 'الهاتف:',
        'settings.about.devEmailLabel': 'البريد الإلكتروني:',
        'settings.about.devFacebookLabel': 'مجموعة فيسبوك:',
        'settings.about.devFacebookLink': 'رابط المجموعة',
        'settings.about.privacyPolicyTitle': 'سياسة الخصوصية',
        'settings.about.privacyPolicyText1': 'نحن نهتم بخصوصيتك. لا يقوم هذا التطبيق بجمع أو تخزين أي بيانات شخصية على خوادمنا. يتم حفظ جميع البيانات التي تنشئها، مثل القصص والإعدادات، محليًا على جهازك فقط باستخدام مساحة تخزين المتصفح.',
        'settings.about.privacyPolicyText2': 'عند استخدام الميزات التي تتطلب اتصالاً بالإنترنت (مثل إنشاء القصص أو الصور)، يتم إرسال مدخلاتك فقط إلى واجهة برمجة تطبيقات Google Gemini لمعالجتها وإعادتها إليك. نحن لا نسجل هذه الطلبات أو استجاباتها.',
        // Actions
        'actions.copy': 'نسخ',
        'actions.listen': 'استماع',
        'actions.proofread': 'تدقيق',
        'actions.summarize': 'تلخيص',
        'actions.print': 'اطبع',
        'actions.exportPdf': 'تصدير PDF',
        'actions.exportWord': 'تصدير Word',
        'actions.exportTxt': 'تصدير TXT',
        // Toasts
        'toast.copied': 'تم نسخ النص بنجاح!',
        'toast.error': 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
        'toast.storySaved': 'تم حفظ القصة في السجل.',
        'toast.proofreading': 'جاري تدقيق النص...',
        'toast.summarizing': 'جاري تلخيص النص...',
        'toast.extending': 'جاري تطوير القصة...',
        'toast.generatingImage': 'جاري إنشاء الصورة...',
        'toast.generatingImageError': 'حدث خطأ أثناء إنشاء الصورة.',
        'toast.generatingStory': 'جاري إنشاء القصة...',
        'toast.generatingInspiration': 'جاري توليد فكرة...',
    },
    en: {
        // App
        'app.title': 'Spark Story',
        'appName': 'Spark Story',
        // Common
        'common.submit': 'Submit',
        'common.download': 'Download',
        // Nav
        'nav.home': 'Home',
        'nav.history': 'History',
        'nav.settings': 'Settings',
        // Home
        'home.title': 'Creativity Studio',
        'home.subtitle': 'A comprehensive suite of AI tools at your fingertips.',
        // Story Creator
        'storyCreator.title': 'Story Creator',
        'storyCreator.description': 'Turn your ideas into text stories, illustrated stories, or novel outlines.',
        'storyCreator.outputType': 'Choose Output Type',
        'storyCreator.typeShort': 'Short Story',
        'storyCreator.typeIllustrated': 'Illustrated Story',
        'storyCreator.typeNovel': 'Novel Outline',
        'storyCreator.details': 'Add Details (Optional)',
        'storyCreator.genre': 'Genre',
        'storyCreator.genre.any': 'Any Genre',
        'storyCreator.genre.sciFi': 'Sci-Fi',
        'storyCreator.genre.fantasy': 'Fantasy',
        'storyCreator.genre.horror': 'Horror',
        'storyCreator.genre.comedy': 'Comedy',
        'storyCreator.genre.drama': 'Drama',
        'storyCreator.genre.adventure': 'Adventure',
        'storyCreator.genre.historical': 'Historical',
        'storyCreator.style': 'Writing Style',
        'storyCreator.style.any': 'Any Style',
        'storyCreator.style.simple': 'Simple & Clear',
        'storyCreator.style.descriptive': 'Descriptive & Detailed',
        'storyCreator.style.humorous': 'Humorous & Satirical',
        'storyCreator.style.poetic': 'Poetic',
        'storyCreator.style.mysterious': 'Mysterious & Suspenseful',
        'storyCreator.promptLabel': 'Write your story idea here...',
        'storyCreator.promptPlaceholder': 'Example: An astronaut discovers a planet made entirely of crystal...',
        'storyCreator.generateButton': 'Start Generating',
        'storyCreator.inspirationTitle': 'Need inspiration?',
        'storyCreator.inspirationText': 'Get a random story idea to get you started.',
        'storyCreator.inspirationButton': 'Give me an idea!',
        'storyCreator.extendPlaceholder': 'Write what you want to happen next... e.g., "Have the hero discover a secret within the crystal"',
        'storyCreator.extendButton': 'Extend Story',
        'storyCreator.scheduleTitle': 'Schedule Generation (Coming Soon)',
        'storyCreator.scheduleLabel': 'Schedule this story for a later time',
        'storyCreator.scheduleTimeLabel': 'Choose Date and Time',
        'storyCreator.scheduleNote': 'Note: This feature is experimental and may not work accurately.',
        // Image Studio
        'imageStudio.title': 'Image & Video Studio',
        'imageStudio.description': 'Create artistic images from text, or turn your images into videos.',
        'imageStudio.t2iTitle': 'Text to Image',
        'imageStudio.t2iPlaceholder': 'Example: A cat wearing a wizard hat reading an ancient book, oil painting style',
        'imageStudio.t2iButton': 'Generate Image',
        'imageStudio.i2vTitle': 'Image to Video (Coming Soon)',
        'imageStudio.i2vFile': 'Choose an image file',
        'imageStudio.i2vPlaceholder': 'Describe the motion you want to add to the image...',
        'imageStudio.i2vButton': 'Generate Video',
        'imageStudio.i2vStatus': 'Generating video, this may take a few minutes...',
        // AI Chat
        'aiChat.title': 'AI Assistant',
        'aiChat.description': 'Ask any question or chat about any topic to get answers.',
        'aiChat.placeholder': 'Example: What is the capital of Australia? or Explain the concept of a black hole simply.',
        // Image Editor
        'imageEditor.title': 'Image Editor',
        'imageEditor.description': 'Edit your images with AI. Ask for changes like "add a hat".',
        'imageEditor.selectFile': 'Select an image to edit',
        'imageEditor.placeholder': 'Describe the edit you want... e.g., "Add sunglasses to the person\'s face" or "Change the sky to a sunset orange".',
        'imageEditor.button': 'Edit Image',
        'imageEditor.resultTitle': 'Edited Image',
         // Comic Creator
        'comicCreator.title': 'Comic Creator',
        'comicCreator.description': 'Turn your text description into a manga or webtoon style art panel.',
        'comicCreator.placeholder': 'Describe the scene you want... e.g., "A lone warrior standing on a mountain peak at sunset, looking at a distant castle, strong winds moving his cloak"',
        'comicCreator.button': 'Create Panel',
        // Story to Comic
        'storyToComic.title': 'Story to Comic',
        'storyToComic.description': 'Paste a short story and the AI will turn it into a comic strip.',
        'storyToComic.placeholder': 'Paste your short story here...',
        'storyToComic.button': 'Convert to Comic',
        // Generic Tools
        'emailWriter.title': 'Email Writer',
        'emailWriter.description': 'Write professional and persuasive emails in seconds.',
        'emailWriter.placeholder': 'Write the purpose of the email... e.g., "Write an email to my manager requesting 3 days off next week for a family matter"',
        'emailWriter.button': 'Create Email',
        'recipeGenerator.title': 'Recipe Generator',
        'recipeGenerator.description': 'Enter the ingredients you have and get an innovative recipe.',
        'recipeGenerator.placeholder': 'List your available ingredients... e.g., "chicken, rice, tomatoes, onions"',
        'recipeGenerator.button': 'Find a Recipe',
        'poemGenerator.title': 'Poem Generator',
        'poemGenerator.description': 'Turn your ideas and feelings into beautiful poems.',
        'poemGenerator.placeholder': 'Write the theme of the poem... e.g., "Write a poem about the beauty of a desert sunrise"',
        'poemGenerator.button': 'Write Poem',
        'songWriter.title': 'Song Writer',
        'songWriter.description': 'Write complete song lyrics for any music genre.',
        'songWriter.placeholder': 'Write the idea and genre of the song... e.g., "Write lyrics for an upbeat pop song about traveling and discovering new places"',
        'songWriter.button': 'Write Song',
        'codeAssistant.title': 'Code Assistant',
        'codeAssistant.description': 'Your smart assistant for writing, explaining, and fixing code.',
        'codeAssistant.placeholder': 'Ask your programming question... e.g., "Write a Python function to calculate the factorial of a number"',
        'codeAssistant.button': 'Get Help',
        'tripPlanner.title': 'Trip Planner',
        'tripPlanner.description': 'Plan your next trip with a detailed daily itinerary.',
        'tripPlanner.placeholder': 'Enter your destination and duration... e.g., "Plan a 7-day trip to Japan"',
        'tripPlanner.button': 'Plan My Trip',
        'workoutExpert.title': 'Workout Expert',
        'workoutExpert.description': 'Get a custom workout plan for your goals.',
        'workoutExpert.placeholder': 'Describe your goal and level... e.g., "A beginner at-home workout plan to lose weight, 3 days a week"',
        'workoutExpert.button': 'Design My Plan',
        'resumeAssistant.title': 'Resume Assistant',
        'resumeAssistant.description': 'Get help improving your resume to increase your chances.',
        'resumeAssistant.placeholder': 'Paste your resume here and ask for a review...',
        'resumeAssistant.button': 'Review My Resume',
        'adWriter.title': 'Ad Writer',
        'adWriter.description': 'Write catchy and persuasive ad copy for your products.',
        'adWriter.placeholder': 'Describe your product... e.g., "New wireless headphones with long battery life and high-quality sound"',
        'adWriter.button': 'Write Ad',
        'socialPost.title': 'Social Post Generator',
        'socialPost.description': 'Create engaging and interactive posts for social media.',
        'socialPost.placeholder': 'Write the topic of the post... e.g., "Write an Instagram post about the importance of drinking water"',
        'socialPost.button': 'Create Post',
        'logoGenerator.title': 'Logo Generator',
        'logoGenerator.description': 'Turn your brand idea into a simple and elegant logo.',
        'logoGenerator.placeholder': 'Describe your brand... e.g., "A logo for a coffee shop named Morning, combining a coffee bean and a rising sun"',
        'logoGenerator.button': 'Design Logo',
        'memeGenerator.title': 'Meme Generator',
        'memeGenerator.description': 'Make your own meme. Upload an image, add text, or ask for a suggestion.',
        'memeGenerator.selectFile': 'Choose a meme image',
        'memeGenerator.topText': 'Top Text',
        'memeGenerator.bottomText': 'Bottom Text',
        'memeGenerator.suggestButton': 'Suggest Text',
        'memeGenerator.downloadButton': 'Download Meme',
        'speechToText.title': 'Speech to Text',
        'speechToText.description': 'Speak and the AI will convert your voice into written text.',
        'speechToText.startRecording': 'Start Recording',
        'speechToText.stopRecording': 'Stop Recording',
        'speechToText.statusIdle': 'Press the button to start voice recording.',
        'speechToText.statusRecording': 'Recording... speak now.',
        'speechToText.statusProcessing': 'Processing...',
        'docQA.title': 'Document Q&A',
        'docQA.description': 'Paste a text or document and ask questions about its content.',
        'docQA.docPlaceholder': 'Paste the text or document here...',
        'docQA.questionPlaceholder': 'Ask your question about the document here...',
        'docQA.button': 'Ask',
        'bgRemover.title': 'Background Remover',
        'bgRemover.description': 'Remove the background of any image with high precision for a transparent result.',
        'bgRemover.selectFile': 'Choose an image',
        'bgRemover.button': 'Remove Background',
        'bgRemover.resultTitle': 'Final Image',
        'ocr.title': 'Image Text Reader (OCR)',
        'ocr.description': 'Upload an image containing text and extract the writing accurately.',
        'ocr.selectFile': 'Choose an image with text',
        'ocr.resultTitle': 'Extracted Text',
        'videoScript.title': 'Video Script Writer',
        'videoScript.description': 'Write a complete script for your next video.',
        'videoScript.placeholder': 'Enter the video topic... e.g., "A video about the top 5 tourist destinations in Egypt"',
        'videoScript.button': 'Write Script',
        'rephrase.title': 'Text Rephraser',
        'rephrase.description': 'Paste any text to get a new version with different words.',
        'rephrase.placeholder': 'Paste the text here...',
        'rephrase.button': 'Rephrase',
        'productDescription.title': 'Product Description Writer',
        'productDescription.description': 'Perfect for e-commerce to write compelling product descriptions.',
        'productDescription.placeholder': 'Enter product name and specs... e.g., "Smartwatch, AMOLED screen, waterproof, 7-day battery"',
        'productDescription.button': 'Write Description',
        'coverLetter.title': 'Cover Letter Writer',
        'coverLetter.description': 'Write a professional and convincing cover letter for jobs.',
        'coverLetter.placeholder': 'Enter job title and key experience... e.g., "Frontend developer with 3 years of experience in React and TypeScript"',
        'coverLetter.button': 'Write Letter',
        'brainstorm.title': 'Brainstorming Assistant',
        'brainstorm.description': 'Get creative and unconventional ideas on any topic.',
        'brainstorm.placeholder': 'Enter the topic you want ideas about... e.g., "Ideas for small online businesses"',
        'brainstorm.button': 'Generate Ideas',
        'jokeGenerator.title': 'Joke Generator',
        'jokeGenerator.description': 'Ask for a joke on any topic for a dose of laughter.',
        'jokeGenerator.placeholder': 'Enter a topic for the joke... e.g., "a joke about programmers"',
        'jokeGenerator.button': 'Tell me a joke',
        'dreamInterpreter.title': 'Dream Interpreter',
        'dreamInterpreter.description': 'Enter your dream and get an interesting and possible interpretation of its meanings.',
        'dreamInterpreter.placeholder': 'Describe your dream in detail...',
        'dreamInterpreter.button': 'Interpret Dream',
        'nameGenerator.title': 'Name Generator',
        'nameGenerator.description': 'For character names, brand names, or anything else.',
        'nameGenerator.placeholder': 'Describe what you need a name for... e.g., "A name for an online store that sells organic products"',
        'nameGenerator.button': 'Generate Names',
        'interviewQuestions.title': 'Interview Question Generator',
        'interviewQuestions.description': 'For hiring managers: prepare effective questions for candidates.',
        'interviewQuestions.placeholder': 'Enter the job title... e.g., "Digital Marketing Manager"',
        'interviewQuestions.button': 'Generate Questions',
        'swot.title': 'SWOT Analysis',
        'swot.description': 'Strategic analysis (Strengths, Weaknesses, Opportunities, Threats) for any project.',
        'swot.placeholder': 'Describe the project or company... e.g., "SWOT analysis for a new food delivery app"',
        'swot.button': 'Analyze Now',
        'videoIdea.title': 'Video Idea Generator',
        'videoIdea.description': 'Get innovative video ideas for your YouTube channel.',
        'videoIdea.placeholder': 'Describe your channel... e.g., "A cooking channel focusing on quick and healthy recipes"',
        'videoIdea.button': 'Generate Ideas',
        'translator.title': 'Translator',
        'translator.description': 'Translate text between different languages accurately and smoothly.',
        'translator.placeholder': 'Enter text to be translated... e.g., "Translate to Arabic: Good morning"',
        'translator.button': 'Translate',
        'formatConverter.title': 'Format Converter',
        'formatConverter.description': 'Convert text from a list of points to a paragraph, or vice versa, and more.',
        'formatConverter.placeholder': 'Paste the text and request the conversion... e.g., "Convert these points into a paragraph: ..."',
        'formatConverter.button': 'Convert',
        'meetingSummarizer.title': 'Meeting Summarizer',
        'meetingSummarizer.description': 'Summarize long meeting minutes into concise points.',
        'meetingSummarizer.placeholder': 'Paste the meeting minutes here...',
        'meetingSummarizer.button': 'Summarize',
        'worldBuilder.title': 'World Builder',
        'worldBuilder.description': 'Build complete fantasy worlds for your stories and games.',
        'worldBuilder.placeholder': 'Write the main idea of the world... e.g., "A world inhabited by beings made of glass living in crystal forests"',
        'worldBuilder.button': 'Build World',
        'characterCreator.title': 'Character Creator',
        'characterCreator.description': 'Create deep and detailed characters for your stories and novels.',
        'characterCreator.placeholder': 'Write the main idea of the character... e.g., "A space pirate searching for a legendary treasure to cure his family"',
        'characterCreator.button': 'Create Character',
        'businessPlan.title': 'Business Plan Writer',
        'businessPlan.description': 'Write professional and detailed business plans for your project.',
        'businessPlan.placeholder': 'Write your project idea and the section you want... e.g., "A mobile coffee shop project, write the market analysis section for me"',
        'businessPlan.button': 'Write Plan',
        // History
        'history.title': 'History',
        'history.description': 'Browse, share, or delete stories you have previously created.',
        'history.searchPlaceholder': 'Search history...',
        'history.empty': 'No saved stories yet. Start by creating a new story!',
        'history.view': 'View',
        'history.delete': 'Delete',
        'history.cleared': 'History cleared successfully.',
        // Settings
        'settings.title': 'Settings',
        'settings.description': 'Control the appearance and behavior of the application.',
        'settings.appearance': 'Appearance',
        'settings.theme': 'Theme',
        'settings.theme.dark': 'Dark',
        'settings.theme.light': 'Light',
        'settings.fontSize': 'Story Font Size',
        'settings.fontSize.small': 'Small',
        'settings.fontSize.medium': 'Medium',
        'settings.fontSize.large': 'Large',
        'settings.language': 'Language',
        'settings.language.ar': 'العربية',
        'settings.language.en': 'English',
        'settings.data': 'Data',
        'settings.history': 'History',
        'settings.clearHistory': 'Clear All History',
        'settings.clearHistoryWarning': 'This will permanently delete all the stories you have created.',
        'settings.clearHistoryConfirm': 'Are you sure you want to delete all history? This action cannot be undone.',
        'settings.about.title': 'About the App',
        'settings.about.appDescription': 'This application is a comprehensive creative studio powered by advanced AI models from Google Gemini to help you turn your ideas into reality.',
        'settings.about.appFeatures': 'It is designed to be fast, efficient, and user-friendly, with a wide range of tools that cater to the needs of creators, writers, marketers, and developers.',
        'settings.about.developerInfo': 'Developer Information',
        'settings.about.devNameLabel': 'Name:',
        'settings.about.devName': 'Ahmed Mostafa Ibrahim',
        'settings.about.devCompanyLabel': 'On behalf of:',
        'settings.about.devCompany': 'Al-Mohtarif for Tax and Legal Consulting',
        'settings.about.devPhoneLabel': 'Phone:',
        'settings.about.devEmailLabel': 'Email:',
        'settings.about.devFacebookLabel': 'Facebook Group:',
        'settings.about.devFacebookLink': 'Group Link',
        'settings.about.privacyPolicyTitle': 'Privacy Policy',
        'settings.about.privacyPolicyText1': 'We care about your privacy. This application does not collect or store any personal data on our servers. All data you create, such as stories and settings, is saved locally on your device only using your browser\'s storage.',
        'settings.about.privacyPolicyText2': 'When using features that require an internet connection (like generating stories or images), your input is sent only to the Google Gemini API for processing and returned to you. We do not log these requests or their responses.',
        // Actions
        'actions.copy': 'Copy',
        'actions.listen': 'Listen',
        'actions.proofread': 'Proofread',
        'actions.summarize': 'Summarize',
        'actions.print': 'Print',
        'actions.exportPdf': 'Export PDF',
        'actions.exportWord': 'Export Word',
        'actions.exportTxt': 'Export TXT',
        // Toasts
        'toast.copied': 'Text copied successfully!',
        'toast.error': 'Something went wrong. Please try again.',
        'toast.storySaved': 'Story saved to history.',
        'toast.proofreading': 'Proofreading text...',
        'toast.summarizing': 'Summarizing text...',
        'toast.extending': 'Extending story...',
        'toast.generatingImage': 'Generating image...',
        'toast.generatingImageError': 'Error generating image.',
        'toast.generatingStory': 'Generating story...',
        'toast.generatingInspiration': 'Generating idea...',
    }
};
const systemInstructions = {
    // Story Tools
    short: "أنت راوي قصص مبدع. اكتب قصة قصيرة وجذابة باللغة العربية بناءً على فكرة المستخدم وتوجيهاته. يجب أن تكون القصة مناسبة لجميع الأعمار.",
    novel: "أنت روائي خبير. بناءً على فكرة المستخدم وتوجيهاته، قم بإنشاء مخطط تفصيلي لرواية كاملة باللغة العربية. يجب أن يتضمن المخطط: 1. ملخص للقصة. 2. وصف للشخصيات الرئيسية (الاسم، الدوافع، التطور). 3. تقسيم مقترح للفصول مع ملخص موجز لكل فصل. استخدم تنسيق الماركداون (مثل # عنوان و ## عنوان فرعي) لتنظيم الإجابة بوضوح.",
    illustrated: "أنت راوي قصص مبدع. اكتب قصة قصيرة وجذابة باللغة العربية بناءً على فكرة المستخدم وتوجيهاته. ركز على وصف الشخصية الرئيسية بشكل واضح ليتمكن فنان من رسمها لاحقاً.",
    character_extractor: "من القصة التالية، قم بوصف الشخصية الرئيسية في جملة واحدة باللغة الإنجليزية، مناسبة لمولد صور يعمل بالذكاء الاصطناعي. ركز على المظهر البصري والسمات المميزة. لا تذكر الاسم. مثال: 'A young female explorer with bright red hair, wearing a futuristic silver jumpsuit and holding a glowing compass'.",
    inspiration_generator: "أنت خبير في إلهام الكتّاب. قم بتوليد فكرة قصة قصيرة ومبتكرة من جملة واحدة باللغة العربية. يجب أن تكون الفكرة مثيرة للفضول وتحفز على الإبداع. مثال: 'ساعاتي يكتشف أن إحدى ساعاته القديمة يمكنها إيقاف الزمن لمدة دقيقة واحدة كل يوم.'",
    proofreader: "أنت محرر خبير. قم بمراجعة النص التالي وتدقيقه لغوياً وإملائياً. قم بتحسين أسلوب الكتابة وجعل السرد أكثر سلاسة وجاذبية، مع الحفاظ على الفكرة الأصلية والشخصيات. قدم النص النهائي المحسّن فقط.",
    summarizer: "أنت خبير في تلخيص النصوص. قم بتلخيص النص التالي في بضع جمل موجزة، مع إبراز النقاط الرئيسية.",
    'comic-creator-page': "أنت فنان مانجا ورسام كوميكس محترف. مهمتك هي تحويل الوصف النصي للمستخدم إلى وصف مرئي قوي باللغة الإنجليزية، جاهز لمولد الصور. يجب أن يكون الأسلوب 'digital art, vibrant colors, detailed illustration, comic book style'. ركز على تكوين المشهد، تعابير الشخصيات، والإضاءة الدرامية.",
    'story-to-comic-page': "أنت مخرج سينمائي ومحلل قصصي. مهمتك هي قراءة القصة القصيرة التالية وتقسيمها إلى 4-6 مشاهد رئيسية (لوحات كوميكس). لكل مشهد، قدم وصفاً بصرياً مفصلاً باللغة الإنجليزية لما يجب أن تحتويه اللوحة، واقتبس جملة سرد أو حوار رئيسية من القصة لهذا المشهد. استجب فقط بتنسيق JSON.",

    // Existing Generic Tools
    'ai-chat-page': "أنت مساعد ذكي ومفيد ومتحدث باللغة العربية. أجب على أسئلة المستخدم بطريقة واضحة وموجزة ومباشرة. استخدم تنسيق الماركداون عند الضرورة لتنظيم المعلومات.",
    'email-writer-page': "أنت خبير في كتابة رسائل البريد الإلكتروني الاحترافية باللغة العربية. بناءً على طلب المستخدم، قم بإنشاء مسودة بريد إلكتروني كاملة، بما في ذلك سطر الموضوع، التحية، المحتوى الرئيسي، والخاتمة المناسبة.",
    'recipe-generator-page': "أنت طاهٍ مبدع وخبير في الوصفات العربية والعالمية. بناءً على المكونات التي يقدمها المستخدم، قم بإنشاء وصفة طعام شهية وسهلة التحضير. يجب أن تتضمن الوصفة: اسم الطبق، قائمة المكونات الدقيقة، وخطوات التحضير المرقمة والواضحة.",
    'poem-generator-page': "أنت شاعر مرهف الحس وتجيد الشعر العربي الفصيح. حوّل فكرة المستخدم أو مشاعره إلى قصيدة جميلة وموزونة. اهتم بالصور الشعرية وجماليات اللغة.",
    'song-writer-page': "أنت كاتب أغانٍ موهوب. بناءً على الفكرة ونوع الموسيقى الذي يحدده المستخدم، قم بكتابة كلمات أغنية كاملة باللغة العربية، مقسمة إلى مقاطع (مثل: مقطع أول، لازمة، مقطع ثانٍ، جسر، لازمة).",
    'code-assistant-page': "أنت مساعد برمجي خبير. أجب على أسئلة المستخدم البرمجية، اكتب أكوادًا، اشرح المفاهيم، أو أصلح الأخطاء. حدد لغة البرمجية بوضوح واستخدم كتل الأكواد المنسقة (markdown code blocks) دائمًا.",
    'trip-planner-page': "أنت خبير في تخطيط الرحلات السياحية. بناءً على وجهة المستخدم ومدته وميزانيته، قم بإنشاء خطة رحلة مفصلة ومنظمة يومًا بيوم. يجب أن تتضمن الخطة اقتراحات للأنشطة، الأماكن السياحية، المطاعم، ونصائح مفيدة.",
    'workout-expert-page': "أنت مدرب لياقة بدنية معتمد. بناءً على هدف المستخدم ومستواه، قم بتصميم خطة تمارين رياضية واضحة وفعالة. يجب أن تتضمن الخطة أسماء التمارين، عدد المجموعات والتكرارات، وفترات الراحة.",
    'resume-assistant-page': "أنت خبير في الموارد البشرية وكتابة السير الذاتية. قم بمراجعة السيرة الذاتية التي يقدمها المستخدم وقدم اقتراحات بناءة ومحددة لتحسينها، مع التركيز على الصياغة، الهيكل، وإبراز نقاط القوة.",
    'ad-writer-page': "أنت كاتب إعلانات وتسويق محترف. بناءً على المنتج أو الخدمة التي يصفها المستخدم، قم بكتابة نص إعلاني قصير، جذاب، ومقنع، يركز على الفوائد ويحث القارئ على اتخاذ إجراء.",
    'social-post-generator-page': "أنت خبير في إدارة وسائل التواصل الاجتماعي. بناءً على الموضوع الذي يطرحه المستخدم، قم بإنشاء أفكار أو نصوص كاملة لمنشورات تفاعلية وجذابة، مع اقتراح وسوم (هاشتاجات) مناسبة.",
    'logo-generator-page': "أنت مصمم شعارات متخصص. بناءً على وصف المستخدم، قم بإنشاء وصف مرئي باللغة الإنجليزية لشعار بسيط، حديث، وأنيق بأسلوب الفيكتور (vector style). يجب أن يكون الوصف مناسباً لمولد صور يعمل بالذكاء الاصطناعي. ركز على الأشكال والألوان الأساسية. مثال: 'a minimalist logo for a coffee shop named 'Morning Brew', featuring a simple outline of a coffee bean integrated with a rising sun, clean lines, warm brown and orange colors'.",
    'meme-generator-page': "أنت خبير في ثقافة الإنترنت والميمز. بناءً على الصورة المرفوعة، اقترح نصاً مضحكاً أو ساخراً من سطر واحد مناسباً للميم.",
    'video-idea-generator-page': "أنت استراتيجي محتوى وخبير في يوتيوب. بناءً على وصف قناة المستخدم، قم بإنشاء 3 أفكار فريدة وجذابة لفيديوهات قادمة. لكل فكرة، قدم عنواناً مثيراً للاهتمام ووصفاً موجزاً ومسودة نصية قصيرة للبداية.",
    'text-to-speech-page': "أنت مساعد صوتي. قم بقراءة النص التالي بصوت واضح وطبيعي.",
    'translator-page': "أنت مترجم فوري محترف. بناءً على طلب المستخدم، قم بترجمة النص المقدم إلى اللغة المطلوبة بدقة وسلاسة. إذا لم يحدد المستخدم لغة، افترض الترجمة بين العربية والإنجليزية.",
    'format-converter-page': "أنت خبير في تنظيم المحتوى. بناءً على طلب المستخدم، قم بتحويل النص المقدم من صيغة إلى أخرى. على سبيل المثال، تحويل قائمة نقاط إلى فقرة متكاملة، أو تحويل نص غير منظم إلى تقرير موجز ومنظم.",
    'meeting-summarizer-page': "أنت مساعد إداري فعال. قم بتلخيص ملاحظات الاجتماع التالية في نقاط موجزة، مع تحديد القرارات الرئيسية ونقاط العمل (Action Items) بوضوح.",
    'world-builder-page': "أنت كاتب خيال علمي وفانتازيا متخصص في بناء العوالم. بناءً على فكرة المستخدم، قم بإنشاء وصف تفصيلي لعالم خيالي. يجب أن يتضمن الوصف جوانب مثل الجغرافيا، التاريخ، الثقافة، الأنواع السائدة، والسحر أو التكنولوجيا.",
    'character-creator-page': "أنت روائي متخصص في تطوير الشخصيات. قم بإنشاء ملف تعريف شخصية عميق ومفصل بناءً على طلب المستخدم. يجب أن يتضمن الملف: الاسم، المظهر، الخلفية الدرامية، الدوافع، نقاط القوة والضعف.",
    'business-plan-writer-page': "أنت مستشار أعمال وخبير في كتابة خطط العمل. بناءً على طلب المستخدم، قم بكتابة قسم احترافي ومفصل من خطة العمل، مع التركيز على الوضوح والجدوى.",
    'doc-qa-page': "أنت مساعد متخصص في الإجابة على الأسئلة بناءً على نص مقدم. اقرأ النص الذي يوفره المستخدم بعناية، ثم أجب على سؤاله المحدد بدقة واقتباس من النص إذا أمكن.",

    // Newest Set of Tools
    'video-script-writer-page': "أنت كاتب سيناريو محترف. بناءً على موضوع المستخدم، اكتب سيناريو فيديو مفصل باللغة العربية. يجب أن يتضمن السيناريو: مقدمة، محتوى مقسم إلى مشاهد أو نقاط، وخاتمة. قم بتضمين اقتراحات للقطات الكاميرا أو التعليق الصوتي.",
    'rephrase-page': "أنت كاتب وخبير لغوي. أعد صياغة النص التالي بأسلوب مختلف مع الحفاظ على المعنى الأصلي. اجعل النص أكثر وضوحاً أو إيجازاً أو إبداعاً حسب الحاجة.",
    'product-description-page': "أنت خبير في التسويق الإلكتروني. بناءً على مواصفات المنتج التي يقدمها المستخدم، اكتب وصفاً جذاباً ومقنعاً للمنتج، يركز على فوائده وميزاته الفريدة ويشجع على الشراء.",
    'cover-letter-page': "أنت خبير توظيف وموارد بشرية. بناءً على تفاصيل المستخدم والوظيفة المستهدفة، اكتب خطاب تغطية احترافي ومخصص يبرز مهارات المرشح وخبراته الأكثر صلة بالوظيفة.",
    'brainstorm-page': "أنت خبير في التفكير الإبداعي. قم بتوليد قائمة من الأفكار المتنوعة والمبتكرة حول الموضوع الذي يطرحه المستخدم. قدم أفكاراً من زوايا مختلفة وغير متوقعة.",
    'joke-generator-page': "أنت كوميدي بارع. اكتب نكتة قصيرة ومضحكة باللغة العربية حول الموضوع الذي يحدده المستخدم.",
    'dream-interpreter-page': "أنت مفسر أحلام رمزي. بناءً على وصف حلم المستخدم، قدم تفسيراً شيقاً ومحتملاً للرموز والأحداث في الحلم، مع التأكيد على أن هذا لأغراض الترفيه فقط.",
    'name-generator-page': "أنت خبير في ابتكار الأسماء. بناءً على وصف المستخدم (على سبيل المثال، 'اسم لمشروع تجاري'، 'اسم لشخصية خيالية')، قم بتوليد قائمة من 10 أسماء فريدة وجذابة.",
    'interview-question-page': "أنت مدير توظيف خبير. بناءً على المسمى الوظيفي الذي يقدمه المستخدم، قم بإنشاء قائمة من أسئلة المقابلة الذكية والموجهة لتقييم مهارات المرشحين وخبراتهم.",
    'swot-analysis-page': "أنت محلل أعمال استراتيجي. بناءً على وصف المشروع أو الشركة، قم بإجراء تحليل SWOT (نقاط القوة، نقاط الضعف، الفرص، التهديدات) وقدمه في شكل منظم وواضح.",
    'ocr-page': "أنت نظام متقدم للتعرف الضوئي على الحروف (OCR). مهمتك هي استخراج كل جزء من النص من الصورة المقدمة بدقة فائقة. انتبه جيدًا للتفاصيل، بما في ذلك علامات الترقيم والأرقام والرموز. حتى لو كان النص مشوهًا أو غير واضح أو يستخدم خطًا معقدًا، ابذل قصارى جهودك لنسخه بدقة. حافظ على فواصل الأسطر والتنسيق الأصلي قدر الإمكان. أجب فقط بالنص المستخرج.",
};
const playIcon = `<svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>`;
const stopIcon = `<svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6 6h12v12H6z"></path></svg>`;
// --- ENDREGION: CONSTANTS ---

// --- REGION: UTILITY FUNCTIONS ---
/**
 * Toggles the loading state of a button.
 * @param button The button element.
 * @param isLoading Whether to show the loader.
 */
function toggleButtonLoading(button: HTMLButtonElement | null, isLoading: boolean) {
    if (!button) return;
    const buttonText = button.querySelector('.button-text') as HTMLSpanElement;
    const loader = button.querySelector('.loader') as HTMLDivElement;
    if (isLoading) {
        button.disabled = true;
        if(buttonText) buttonText.style.opacity = '0';
        if(loader) loader.classList.remove('hidden');
    } else {
        button.disabled = false;
        if(buttonText) buttonText.style.opacity = '1';
        if(loader) loader.classList.add('hidden');
    }
}

/**
 * Converts a File object to a Gemini API-compatible Part.
 * @param file The file to convert.
 * @returns A promise that resolves with the Part object.
 */
function fileToGenerativePart(file: File): Promise<Part> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({
                inlineData: {
                    mimeType: file.type,
                    data: base64,
                },
            });
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}

/**
 * Shows a toast notification.
 * @param message The message to display.
 * @param type The type of toast ('success' or 'error').
 */
function showToast(message: string, type: 'success' | 'error' = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * Displays an error message in a container.
 * @param container The container to display the error in.
 * @param message The error message.
 */
function displayError(container: HTMLElement, message: string) {
    container.innerHTML = `<p class="error">${message}</p>`;
}

/**
 * Displays a skeleton loader for text content.
 * @param container The container to display the skeleton loader in.
 */
function showSkeletonLoader(container: HTMLElement) {
    container.innerHTML = `
        <div class="skeleton-loader">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
        </div>
    `;
}
// --- ENDREGION: UTILITY FUNCTIONS ---

// --- REGION: UI & TRANSLATION FUNCTIONS ---
/**
 * Applies all translations to the DOM based on the current language state.
 */
function applyTranslations() {
    const selectedTranslations = translations[state.currentLang];
    document.documentElement.lang = state.currentLang;
    document.documentElement.dir = state.currentLang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.getAttribute('data-translate-key');
        if (key && selectedTranslations[key]) el.innerHTML = selectedTranslations[key];
    });

    document.querySelectorAll('[data-translate-placeholder-key]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder-key');
        if (key && selectedTranslations[key]) {
            (el as HTMLInputElement | HTMLTextAreaElement).placeholder = selectedTranslations[key];
        }
    });

    document.querySelectorAll('[data-translate-title-key]').forEach(el => {
        const key = el.getAttribute('data-translate-title-key');
        if (key && selectedTranslations[key]) {
            (el as HTMLElement).title = selectedTranslations[key];
        }
    });

    document.title = selectedTranslations['app.title'];
}

/**
 * Sets the application language, updates UI, and persists the setting.
 * @param lang The language to set.
 * @param isInitialLoad Flag to prevent reload on initial setup.
 */
function setLanguage(lang: 'ar' | 'en', isInitialLoad: boolean = false) {
    const newLang = (lang === 'en' || lang === 'ar') ? lang : 'ar';
    state.currentLang = newLang;
    const langRadio = document.querySelector(`input[name="language"][value="${state.currentLang}"]`) as HTMLInputElement;
    if (langRadio) langRadio.checked = true;

    applyTranslations();

    if (!isInitialLoad && localStorage.getItem('spark-story-lang') !== newLang) {
        localStorage.setItem('spark-story-lang', newLang);
        location.reload();
    }
}

// FIX: Implement `stopListening` function to handle speech synthesis cancellation. This function was called but not defined.
/**
 * Stops any ongoing text-to-speech playback.
 */
function stopListening() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        DOM.listenBtn.innerHTML = playIcon;
        if (state.currentUtterance) {
            state.currentUtterance.onend = null;
        }
        state.currentUtterance = null;
    }
}

/**
 * Navigates to a specific page.
 * @param pageId The ID of the page to navigate to.
 */
function navigateToPage(pageId: string) {
    DOM.pages.forEach(page => page.classList.remove('active-page'));
    document.getElementById(pageId)?.classList.add('active-page');
    DOM.navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-page') === pageId);
    });
    if (pageId !== 'story-creator-page') stopListening();
}

/**
 * Renders a story in the main story creator view.
 * @param story The story object to render.
 */
function renderStory(story: Story) {
    const htmlContent = marked.parse(story.text) as string;
    DOM.storyContainer.innerHTML = htmlContent;

    if (story.type === 'illustrated' && story.imageUrl) {
        DOM.storyImage.src = story.imageUrl;
        DOM.storyImage.classList.remove('hidden');
        DOM.imageLoader.classList.add('hidden');
        DOM.storyImageContainer.classList.remove('hidden');
    } else {
        DOM.storyImageContainer.classList.add('hidden');
    }

    DOM.resultCard.classList.remove('hidden');
    DOM.actionToolbar.classList.remove('hidden');
    DOM.extendStoryForm.classList.remove('hidden');
    state.activeStoryId = story.id;
    DOM.resultCard.scrollIntoView({ behavior: 'smooth' });
}
// --- ENDREGION: UI & TRANSLATION FUNCTIONS ---

// --- REGION: API CALL WRAPPER ---
/**
 * A generic wrapper for handling API calls.
 * Manages loading states, error handling, and result display.
 * @param form The form element that triggered the call.
 * @param resultContainer The element to display the result or loader in.
 * @param apiCall The async function that performs the API call.
 */
async function handleApiCall(form: HTMLFormElement, resultContainer: HTMLElement, apiCall: () => Promise<string | void>) {
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    const resultCard = resultContainer.closest('.card');
    
    toggleButtonLoading(button, true);
    if(resultCard) resultCard.classList.remove('hidden');
    showSkeletonLoader(resultContainer);
    
    try {
        const result = await apiCall();
        if (typeof result === 'string') {
            const htmlContent = marked.parse(result) as string;
            resultContainer.innerHTML = htmlContent;
        }
    } catch (error) {
        console.error("API Call Error:", error);
        displayError(resultContainer, translations[state.currentLang]['toast.error']);
    } finally {
        toggleButtonLoading(button, false);
    }
}
// --- ENDREGION: API CALL WRAPPER ---

// --- REGION: CORE TOOL HANDLERS ---
/**
 * Handles the main story generation logic.
 */
async function handleStoryGeneration(e: Event) {
    e.preventDefault();
    if (!DOM.promptInput.value.trim()) return;
    
    toggleButtonLoading(DOM.generateBtn, true);
    showToast(translations[state.currentLang]['toast.generatingStory']);
    DOM.resultCard.classList.remove('hidden');
    showSkeletonLoader(DOM.storyContainer);
    DOM.storyImageContainer.classList.add('hidden');
    DOM.actionToolbar.classList.add('hidden');

    const storyType = (document.querySelector('input[name="story-type"]:checked') as HTMLInputElement).value;
    const prompt = DOM.promptInput.value;
    const genre = DOM.genreSelect.value;
    const style = DOM.styleSelect.value;
    let fullPrompt = prompt;
    if (genre !== 'any') fullPrompt += `\nالنوع: ${DOM.genreSelect.options[DOM.genreSelect.selectedIndex].text}`;
    if (style !== 'any') fullPrompt += `\nأسلوب الكتابة: ${DOM.styleSelect.options[DOM.styleSelect.selectedIndex].text}`;
    
    try {
        const response = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: { systemInstruction: systemInstructions[storyType] },
        });
        const storyText = response.text;
        let imageUrl: string | undefined;

        if (storyType === 'illustrated') {
            DOM.storyImageContainer.classList.remove('hidden');
            DOM.imageLoader.classList.remove('hidden');
            DOM.storyImage.classList.add('hidden');
            showToast(translations[state.currentLang]['toast.generatingImage']);

            try {
                const charDescResponse = await state.ai!.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: storyText,
                    config: { systemInstruction: systemInstructions['character_extractor'] },
                });
                const imageResponse = await state.ai!.models.generateImages({
                    model: 'imagen-4.0-generate-001', prompt: charDescResponse.text,
                });
                if (imageResponse.generatedImages?.length > 0) {
                    imageUrl = `data:image/png;base64,${imageResponse.generatedImages[0].image.imageBytes}`;
                }
            } catch (imgError) {
                console.error("Error generating image:", imgError);
                showToast(translations[state.currentLang]['toast.generatingImageError'], 'error');
            }
        }
        const newStory = addStoryToHistory({
            title: prompt.substring(0, 40) + '...', prompt, text: storyText, type: storyType, imageUrl,
        });
        renderStory(newStory);
    } catch (error) {
        console.error("Error generating story:", error);
        displayError(DOM.storyContainer, translations[state.currentLang]['toast.error']);
    } finally {
        toggleButtonLoading(DOM.generateBtn, false);
    }
}

/**
 * Generates a random story idea.
 */
async function generateInspiration() {
    toggleButtonLoading(DOM.inspirationBtn, true);
    showToast(translations[state.currentLang]['toast.generatingInspiration']);
    try {
        const response = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Generate a one-sentence creative story prompt in Arabic.",
            config: { systemInstruction: systemInstructions['inspiration_generator'] },
        });
        DOM.promptInput.value = response.text;
        DOM.promptInput.focus();
    } catch (error) {
        console.error("Error generating inspiration:", error);
        showToast(translations[state.currentLang]['toast.error'], 'error');
    } finally {
        toggleButtonLoading(DOM.inspirationBtn, false);
    }
}

/**
 * Extends the currently active story.
 */
async function handleExtendStory(e: Event) {
    e.preventDefault();
    const extendPrompt = DOM.extendPromptInput.value.trim();
    if (!extendPrompt || state.activeStoryId === null) return;
    const currentStory = state.savedStories.find(s => s.id === state.activeStoryId);
    if (!currentStory) return;

    toggleButtonLoading(DOM.extendBtn, true);
    showToast(translations[state.currentLang]['toast.extending']);
    try {
        const fullPrompt = `Here is a story:\n\n${currentStory.text}\n\nPlease continue the story based on this instruction: ${extendPrompt}`;
        const response = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: { systemInstruction: systemInstructions[currentStory.type] },
        });
        currentStory.text += "\n\n" + response.text;
        saveHistory();
        renderStory(currentStory);
        DOM.extendPromptInput.value = '';
    } catch (error) {
        console.error("Error extending story:", error);
        showToast(translations[state.currentLang]['toast.error'], 'error');
    } finally {
        toggleButtonLoading(DOM.extendBtn, false);
    }
}

/**
 * Generic handler for simple text-in, text-out tools.
 */
async function handleGenericTool(e: Event, pageId: string) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('.generic-prompt-input') as HTMLTextAreaElement;
    const resultCard = document.querySelector(`#${pageId} .generic-result-card`) as HTMLElement;
    const resultContainer = resultCard.querySelector('.generic-result-container') as HTMLElement;
    if (!input.value.trim()) return;

    await handleApiCall(form, resultContainer, async () => {
        const response = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: input.value,
            config: { systemInstruction: systemInstructions[pageId] },
        });
        return response.text;
    });
}

/**
 * Handles the Document Q&A tool logic.
 */
async function handleDocQa(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const resultCard = document.querySelector('#doc-qa-page .generic-result-card') as HTMLElement;
    const resultContainer = resultCard.querySelector('.generic-result-container') as HTMLElement;
    const documentText = DOM.docQaDocInput.value.trim();
    const questionText = DOM.docQaQuestionInput.value.trim();
    if (!documentText || !questionText) return;

    await handleApiCall(form, resultContainer, async () => {
        const fullPrompt = `النص:\n${documentText}\n\nالسؤال:\n${questionText}`;
        const response = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: { systemInstruction: systemInstructions['doc-qa-page'] },
        });
        return response.text;
    });
}
// --- ENDREGION: CORE TOOL HANDLERS ---

// --- REGION: IMAGE & VIDEO TOOL HANDLERS ---
async function handleTextToImage(e: Event) {
    e.preventDefault();
    const prompt = DOM.t2iPromptInput.value.trim();
    if (!prompt) return;

    toggleButtonLoading(DOM.t2iGenerateBtn, true);
    DOM.t2iResultContainer.classList.remove('hidden');
    DOM.t2iImageLoader.classList.remove('hidden');
    DOM.t2iResultImage.classList.add('hidden');
    try {
        const response = await state.ai!.models.generateImages({
            model: 'imagen-4.0-generate-001', prompt,
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        DOM.t2iResultImage.src = `data:image/png;base64,${base64ImageBytes}`;
        DOM.t2iResultImage.classList.remove('hidden');
    } catch (error) {
        console.error("Error in text-to-image:", error);
        DOM.t2iResultContainer.innerHTML = `<p class="error">${translations[state.currentLang]['toast.error']}</p>`;
    } finally {
        toggleButtonLoading(DOM.t2iGenerateBtn, false);
        DOM.t2iImageLoader.classList.add('hidden');
    }
}

async function handleImageEdit(e: Event) {
    e.preventDefault();
    const file = DOM.imageEditorFileInput.files?.[0];
    const prompt = DOM.imageEditorPrompt.value;
    if (!file || !prompt) return;

    const button = (e.target as HTMLFormElement).querySelector('button') as HTMLButtonElement;
    toggleButtonLoading(button, true);
    DOM.imageEditorResultCard.classList.remove('hidden');
    DOM.imageEditorResultLoader.classList.remove('hidden');
    DOM.imageEditorResultImage.classList.add('hidden');
    try {
        const imagePart = await fileToGenerativePart(file);
        const response = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [ imagePart, { text: prompt } ] },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });
        let foundImage = false;
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                DOM.imageEditorResultImage.src = `data:image/png;base64,${part.inlineData.data}`;
                DOM.imageEditorResultImage.classList.remove('hidden');
                foundImage = true;
                break;
            }
        }
        if (!foundImage) throw new Error("No image was returned by the model.");
    } catch (error) {
        console.error("Error editing image:", error);
        DOM.imageEditorResultCard.innerHTML = `<p class="error">${translations[state.currentLang]['toast.error']}</p>`;
    } finally {
        toggleButtonLoading(button, false);
        DOM.imageEditorResultLoader.classList.add('hidden');
    }
}
// --- ENDREGION: IMAGE & VIDEO TOOL HANDLERS ---

// --- REGION: COMIC TOOL HANDLERS ---
async function handleComicCreator(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const prompt = (form.querySelector('textarea') as HTMLTextAreaElement).value.trim();
    if (!prompt) return;
    
    toggleButtonLoading(form.querySelector('button'), true);
    DOM.comicCreatorResultCard.classList.remove('hidden');
    DOM.comicCreatorResultLoader.classList.remove('hidden');
    DOM.comicCreatorResultImage.classList.add('hidden');
    try {
        const imagePromptResponse = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction: systemInstructions['comic-creator-page'] },
        });
        const imageResponse = await state.ai!.models.generateImages({
            model: 'imagen-4.0-generate-001', prompt: imagePromptResponse.text,
        });
        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        DOM.comicCreatorResultImage.src = `data:image/png;base64,${base64ImageBytes}`;
        DOM.comicCreatorResultImage.classList.remove('hidden');
    } catch (error) {
        console.error("Error in comic creator:", error);
        DOM.comicCreatorResultCard.innerHTML = `<p class="error">${translations[state.currentLang]['toast.error']}</p>`;
    } finally {
        toggleButtonLoading(form.querySelector('button'), false);
        DOM.comicCreatorResultLoader.classList.add('hidden');
    }
}

async function handleStoryToComic(e: Event) {
    e.preventDefault();
    const story = DOM.storyToComicPrompt.value.trim();
    if (!story) return;

    const button = (e.target as HTMLFormElement).querySelector('button') as HTMLButtonElement;
    toggleButtonLoading(button, true);
    DOM.storyToComicResultCard.classList.remove('hidden');
    DOM.comicResultGrid.innerHTML = '';
    DOM.storyToComicStatus.textContent = 'Analyzing story...';
    try {
        const panelsResponse = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: story,
            config: {
                systemInstruction: systemInstructions['story-to-comic-page'],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            scene_description: { type: Type.STRING },
                            quote: { type: Type.STRING }
                        }
                    }
                }
            },
        });
        const panels = JSON.parse(panelsResponse.text);
        for (let i = 0; i < panels.length; i++) {
            DOM.storyToComicStatus.textContent = `Generating panel ${i + 1} of ${panels.length}...`;
            const panel = panels[i];
            const imagePrompt = `${panel.scene_description}, digital art, vibrant colors, detailed illustration, comic book style`;
            const imageResponse = await state.ai!.models.generateImages({
                model: 'imagen-4.0-generate-001', prompt: imagePrompt,
            });
            const imageUrl = `data:image/png;base64,${imageResponse.generatedImages[0].image.imageBytes}`;
            const panelElement = document.createElement('div');
            panelElement.className = 'comic-panel';
            panelElement.innerHTML = `
                <img src="${imageUrl}" alt="${panel.scene_description}">
                <p class="caption">${panel.quote}</p>`;
            DOM.comicResultGrid.appendChild(panelElement);
        }
        DOM.storyToComicStatus.textContent = 'Done!';
    } catch (error) {
        console.error("Error in story-to-comic:", error);
        DOM.storyToComicStatus.textContent = translations[state.currentLang]['toast.error'];
    } finally {
        toggleButtonLoading(button, false);
    }
}
// --- ENDREGION: COMIC TOOL HANDLERS ---

// --- REGION: OTHER TOOL HANDLERS ---
async function handleLogoGeneration(e: Event) {
    e.preventDefault();
    const prompt = (DOM.logoGeneratorForm.querySelector('textarea') as HTMLTextAreaElement).value.trim();
    if (!prompt) return;
    
    const button = (e.target as HTMLFormElement).querySelector('button') as HTMLButtonElement;
    toggleButtonLoading(button, true);
    DOM.logoResultContainer.classList.remove('hidden');
    DOM.logoResultLoader.classList.remove('hidden');
    DOM.logoResultImage.classList.add('hidden');
    try {
        const imagePromptResponse = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction: systemInstructions['logo-generator-page'] },
        });
        const imageResponse = await state.ai!.models.generateImages({
            model: 'imagen-4.0-generate-001', prompt: imagePromptResponse.text,
        });
        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        DOM.logoResultImage.src = `data:image/png;base64,${base64ImageBytes}`;
        DOM.logoResultImage.classList.remove('hidden');
    } catch (error) {
        console.error("Error in logo generator:", error);
        DOM.logoResultContainer.innerHTML = `<p class="error">${translations[state.currentLang]['toast.error']}</p>`;
    } finally {
        toggleButtonLoading(button, false);
        DOM.logoResultLoader.classList.add('hidden');
    }
}

async function handleBackgroundRemoval(e: Event) {
    e.preventDefault();
    const file = DOM.bgRemoverFileInput.files?.[0];
    if (!file) return;

    const button = (e.target as HTMLFormElement).querySelector('button') as HTMLButtonElement;
    toggleButtonLoading(button, true);
    DOM.bgRemoverResultCard.classList.remove('hidden');
    DOM.bgRemoverResultLoader.classList.remove('hidden');
    DOM.bgRemoverResultImage.classList.add('hidden');
    try {
        const imagePart = await fileToGenerativePart(file);
        const prompt = "Remove the background from this image completely, leaving only the main subject with a transparent background.";
        const response = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [imagePart, { text: prompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });
        let foundImage = false;
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                DOM.bgRemoverResultImage.src = `data:image/png;base64,${part.inlineData.data}`;
                DOM.bgRemoverResultImage.classList.remove('hidden');
                foundImage = true;
                break;
            }
        }
        if (!foundImage) throw new Error("No image returned.");
    } catch (error) {
        console.error("Error removing background:", error);
        DOM.bgRemoverResultCard.innerHTML = `<p class="error">${translations[state.currentLang]['toast.error']}</p>`;
    } finally {
        toggleButtonLoading(button, false);
        DOM.bgRemoverResultLoader.classList.add('hidden');
    }
}

async function handleOcr(file: File) {
    DOM.ocrResultCard.classList.remove('hidden');
    showSkeletonLoader(DOM.ocrResultContainer);
    DOM.ocrDownloadLink.classList.add('hidden');
    try {
        const imagePart = await fileToGenerativePart(file);
        const response = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, {text: "Extract all text from this image."}] },
            config: { systemInstruction: systemInstructions['ocr-page'] }
        });
        DOM.ocrResultContainer.textContent = response.text;
        // Make download link functional
        const blob = new Blob([response.text], { type: 'text/plain' });
        DOM.ocrDownloadLink.href = URL.createObjectURL(blob);
        DOM.ocrDownloadLink.classList.remove('hidden');
    } catch (error) {
        console.error("Error in OCR:", error);
        displayError(DOM.ocrResultContainer, translations[state.currentLang]['toast.error']);
    }
}
// --- ENDREGION: OTHER TOOL HANDLERS ---

// --- REGION: ACTION TOOLBAR HANDLERS ---
async function handleProofread() {
    const originalText = DOM.storyContainer.innerText;
    showToast(translations[state.currentLang]['toast.proofreading']);
    showSkeletonLoader(DOM.storyContainer);
    try {
        const response = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: originalText,
            config: { systemInstruction: systemInstructions['proofreader'] },
        });
        DOM.storyContainer.innerHTML = marked.parse(response.text) as string;
    } catch (error) {
        console.error("Error proofreading:", error);
        DOM.storyContainer.innerHTML = originalText;
        showToast(translations[state.currentLang]['toast.error'], 'error');
    }
}

async function handleSummarize() {
    const originalText = DOM.storyContainer.innerText;
    showToast(translations[state.currentLang]['toast.summarizing']);
    try {
        const response = await state.ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: originalText,
            config: { systemInstruction: systemInstructions['summarizer'] },
        });
        alert(response.text);
    } catch (error) {
        console.error("Error summarizing:", error);
        showToast(translations[state.currentLang]['toast.error'], 'error');
    }
}

function handlePrint() {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
        printWindow.document.write('<html><head><title>Print Story</title><style> body { font-family: sans-serif; } </style></head><body>');
        printWindow.document.write(DOM.storyContainer.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
}

async function handleExportPDF() {
    const canvas = await html2canvas(DOM.storyContainer);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save("story.pdf");
}

async function handleExportWord() {
    const paragraphs = Array.from(DOM.storyContainer.children).map(child => {
        return new Paragraph({
            children: [new TextRun((child as HTMLElement).innerText)],
            alignment: state.currentLang === 'ar' ? AlignmentType.RIGHT : AlignmentType.LEFT,
        });
    });
    const doc = new Document({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'story.docx';
    link.click();
    link.remove();
}

function handleExportTXT() {
    const text = DOM.storyContainer.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'story.txt';
    link.click();
    link.remove();
}
// --- ENDREGION: ACTION TOOLBAR HANDLERS ---

// --- REGION: HISTORY MANAGEMENT ---
function loadHistory() {
    const historyJson = localStorage.getItem('spark-story-history');
    if (historyJson) state.savedStories = JSON.parse(historyJson);
}

function saveHistory() {
    localStorage.setItem('spark-story-history', JSON.stringify(state.savedStories));
}

// FIX: Provide implementation for the `addStoryToHistory` function.
function addStoryToHistory(storyData: Omit<Story, 'id' | 'timestamp'>): Story {
    const newStory: Story = {
        ...storyData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
    };
    state.savedStories.unshift(newStory);
    if (state.savedStories.length > 50) { // Keep history manageable
        state.savedStories.pop();
    }
    saveHistory();
    showToast(translations[state.currentLang]['toast.storySaved']);
    return newStory;
}

function renderHistory(filter = '') {
    DOM.historyListContainer.innerHTML = '';
    const filteredStories = state.savedStories.filter(story =>
        story.title.toLowerCase().includes(filter.toLowerCase()) ||
        story.prompt.toLowerCase().includes(filter.toLowerCase()) ||
        story.text.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredStories.length === 0) {
        DOM.historyListContainer.innerHTML = `<p class="empty-state">${translations[state.currentLang]['history.empty']}</p>`;
        return;
    }

    filteredStories.forEach(story => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-item-content" data-story-id="${story.id}">
                <h4>${story.title}</h4>
                <p>${new Date(story.timestamp).toLocaleString()}</p>
            </div>
            <div class="history-item-actions">
                <button class="view-btn" data-story-id="${story.id}" title="${translations[state.currentLang]['history.view']}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>
                </button>
                <button class="delete-btn" data-story-id="${story.id}" title="${translations[state.currentLang]['history.delete']}">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
                </button>
            </div>
        `;
        DOM.historyListContainer.appendChild(item);
    });
}
// --- ENDREGION: HISTORY MANAGEMENT ---

// --- REGION: INITIALIZATION ---
/**
 * Initializes the application, sets up event listeners, and loads initial data.
 */
async function initializeApp() {
    // 1. Initialize API Client
    try {
        state.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (error) {
        console.error("Failed to initialize GoogleGenAI:", error);
        alert("Failed to initialize AI. Check API Key and connection.");
        return;
    }

    // 2. Load Data and Settings
    loadHistory();
    const savedLang = localStorage.getItem('spark-story-lang') as 'ar' | 'en' | null;
    setLanguage(savedLang || 'ar', true);

    const savedTheme = localStorage.getItem('spark-story-theme');
    document.documentElement.setAttribute('data-theme', savedTheme || 'dark');
    const themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme || 'dark'}"]`) as HTMLInputElement;
    if(themeRadio) themeRadio.checked = true;

    const savedFontSize = localStorage.getItem('spark-story-font-size');
    DOM.storyContainer.className = `font-size-${savedFontSize || 'medium'}`;
    const fontRadio = document.querySelector(`input[name="font-size"][value="${savedFontSize || 'medium'}"]`) as HTMLInputElement;
    if(fontRadio) fontRadio.checked = true;

    // 3. Attach Event Listeners
    // Navigation
    DOM.navButtons.forEach(btn => btn.addEventListener('click', () => navigateToPage((btn as HTMLElement).dataset.page!)));
    DOM.toolCards.forEach(card => card.addEventListener('click', () => {
        navigateToPage((card as HTMLElement).dataset.targetPage!);
        window.scrollTo(0,0);
    }));

    // Tooltips for tool cards
    DOM.toolCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const key = card.getAttribute('data-translate-title-key');
            if (key && translations[state.currentLang][key]) {
                const title = translations[state.currentLang][key];
                DOM.tooltip.textContent = title;
                const rect = card.getBoundingClientRect();
                DOM.tooltip.style.left = `${rect.left + rect.width / 2}px`;
                DOM.tooltip.style.top = `${rect.top - 10}px`;
                DOM.tooltip.style.transform = 'translate(-50%, -100%)';
                DOM.tooltip.classList.add('visible');
            }
        });
        card.addEventListener('mouseleave', () => {
            DOM.tooltip.classList.remove('visible');
        });
    });

    // Story Creator
    DOM.promptForm.addEventListener('submit', handleStoryGeneration);
    DOM.inspirationBtn.addEventListener('click', generateInspiration);
    DOM.extendStoryForm.addEventListener('submit', handleExtendStory);
    DOM.scheduleCheckbox.addEventListener('change', () => DOM.scheduleOptions.classList.toggle('hidden', !DOM.scheduleCheckbox.checked));

    // Action Toolbar
    DOM.copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(DOM.storyContainer.innerText);
        showToast(translations[state.currentLang]['toast.copied']);
    });
    DOM.listenBtn.addEventListener('click', () => {
        if (speechSynthesis.speaking) {
            stopListening();
        } else {
            const text = DOM.storyContainer.innerText;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = state.currentLang === 'ar' ? 'ar-SA' : 'en-US';
            state.currentUtterance = utterance;
            utterance.onend = () => {
                DOM.listenBtn.innerHTML = playIcon;
                state.currentUtterance = null;
            };
            speechSynthesis.speak(utterance);
            DOM.listenBtn.innerHTML = stopIcon;
        }
    });
    DOM.proofreadBtn.addEventListener('click', handleProofread);
    DOM.summarizeBtn.addEventListener('click', handleSummarize);
    DOM.printBtn.addEventListener('click', handlePrint);
    DOM.pdfBtn.addEventListener('click', handleExportPDF);
    DOM.wordBtn.addEventListener('click', handleExportWord);
    DOM.txtBtn.addEventListener('click', handleExportTXT);

    // Image & Video Studio
    DOM.textToImageForm.addEventListener('submit', handleTextToImage);
    DOM.i2vFileInput.addEventListener('change', () => {
        if (DOM.i2vFileInput.files?.length) {
            DOM.fileNameSpan.textContent = DOM.i2vFileInput.files[0].name;
        }
    });

    // Image Editor
    DOM.imageEditorForm.addEventListener('submit', handleImageEdit);
    DOM.imageEditorFileInput.addEventListener('change', () => {
        if (DOM.imageEditorFileInput.files?.length) {
            const file = DOM.imageEditorFileInput.files[0];
            DOM.imageEditorFileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = e => {
                DOM.imageEditorPreviewImage.src = e.target?.result as string;
                DOM.imageEditorPreviewContainer.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        }
    });

    // Comic Creator
    DOM.comicCreatorForm.addEventListener('submit', handleComicCreator);
    DOM.storyToComicForm.addEventListener('submit', handleStoryToComic);

    // Other Tools
    DOM.logoGeneratorForm.addEventListener('submit', handleLogoGeneration);
    DOM.docQaForm.addEventListener('submit', handleDocQa);
    DOM.bgRemoverForm.addEventListener('submit', handleBackgroundRemoval);
    DOM.bgRemoverFileInput.addEventListener('change', () => {
        if (DOM.bgRemoverFileInput.files?.length) {
            const file = DOM.bgRemoverFileInput.files[0];
            DOM.bgRemoverFileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = e => {
                DOM.bgRemoverPreviewImage.src = e.target?.result as string;
                DOM.bgRemoverPreviewContainer.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        }
    });
    DOM.ocrFileInput.addEventListener('change', () => {
        const file = DOM.ocrFileInput.files?.[0];
        if (file) {
            DOM.ocrFileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = e => {
                DOM.ocrPreviewImage.src = e.target?.result as string;
                DOM.ocrPreviewContainer.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
            handleOcr(file);
        }
    });

    // Speech to Text
    DOM.recordBtn.addEventListener('click', () => {
        showToast("Speech-to-text is not available in this version.", "error");
    });
    
    // Generic Tools
    document.querySelectorAll('.generic-tool-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            const pageId = form.closest('.page')?.id;
            if (pageId) handleGenericTool(e, pageId);
        });
    });

    // History Page
    DOM.historySearchInput.addEventListener('input', (e) => renderHistory((e.target as HTMLInputElement).value));
    DOM.historyListContainer.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        // FIX: Cast results of `closest` to HTMLElement to access the `dataset` property.
        const viewBtn = target.closest<HTMLElement>('.view-btn');
        const deleteBtn = target.closest<HTMLElement>('.delete-btn');
        const content = target.closest<HTMLElement>('.history-item-content');
        const storyId = parseInt(viewBtn?.dataset.storyId || deleteBtn?.dataset.storyId || content?.dataset.storyId || '');
        if (!storyId) return;

        if (viewBtn || content) {
            const story = state.savedStories.find(s => s.id === storyId);
            if (story) {
                renderStory(story);
                navigateToPage('story-creator-page');
            }
        } else if (deleteBtn) {
            state.savedStories = state.savedStories.filter(s => s.id !== storyId);
            saveHistory();
            renderHistory(DOM.historySearchInput.value);
        }
    });

    // Settings Page
    DOM.themeSwitcher?.addEventListener('change', (e) => {
        const theme = (e.target as HTMLInputElement).value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('spark-story-theme', theme);
    });
    DOM.fontSizeSwitcher?.addEventListener('change', (e) => {
        const size = (e.target as HTMLInputElement).value;
        DOM.storyContainer.className = `font-size-${size}`;
        localStorage.setItem('spark-story-font-size', size);
    });
    DOM.languageSwitcher?.addEventListener('change', (e) => {
        setLanguage((e.target as HTMLInputElement).value as 'ar' | 'en');
    });
    DOM.clearHistoryBtn?.addEventListener('click', () => {
        if (confirm(translations[state.currentLang]['settings.clearHistoryConfirm'])) {
            state.savedStories = [];
            saveHistory();
            renderHistory();
            showToast(translations[state.currentLang]['history.cleared']);
        }
    });

    // Initial render for history if navigating to it
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target as HTMLElement;
                if (target.id === 'history-page' && target.classList.contains('active-page')) {
                    renderHistory();
                }
            }
        }
    });
    observer.observe(document.getElementById('history-page')!, { attributes: true });
}

document.addEventListener('DOMContentLoaded', initializeApp);
// --- ENDREGION: INITIALIZATION ---
