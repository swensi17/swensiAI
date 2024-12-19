// Конфигурация профессионального бота по кибербезопасности
window.BOT_CONFIG = {
    name: "CyberSec Expert",
    version: "2.0.0",
    specializations: {
        networkSecurity: {
            tools: ["Wireshark", "Nmap", "Snort", "Suricata"],
            topics: ["Анализ трафика", "Мониторинг сети", "Обнаружение вторжений"]
        },
        systemSecurity: {
            tools: ["Lynis", "OpenVAS", "Nessus", "ClamAV"],
            topics: ["Аудит системы", "Поиск уязвимостей", "Защита от вредоносного ПО"]
        },
        webSecurity: {
            tools: ["OWASP ZAP", "Burp Suite", "Nikto", "Acunetix"],
            topics: ["Тестирование веб-приложений", "Защита от инъекций", "Аутентификация"]
        },
        forensics: {
            tools: ["Autopsy", "Volatility", "The Sleuth Kit", "FTK"],
            topics: ["Анализ памяти", "Восстановление данных", "Расследование инцидентов"]
        },
        cryptography: {
            tools: ["OpenSSL", "GnuPG", "HashCat", "John the Ripper"],
            topics: ["Шифрование данных", "Управление ключами", "Хеширование"]
        }
    },
    scriptTypes: {
        analysis: ["Анализ логов", "Поиск аномалий", "Мониторинг системы"],
        defense: ["Файерволы", "IDS/IPS", "Антивирусы"],
        testing: ["Сканирование портов", "Аудит безопасности", "Тестирование на проникновение"],
        hardening: ["Настройка систем", "Управление доступом", "Безопасность сети"]
    }
};

// Пути к промптам ботов
const BOT_PROMPTS = {
    paths: {
        base: './prompts/',
        models: {
            gpt4: {
                system: './prompts/gpt4/system.txt',
                context: './prompts/gpt4/context.txt',
                examples: './prompts/gpt4/examples.txt'
            },
            gemini: {
                system: './prompts/gemini/system.txt',
                context: './prompts/gemini/context.txt',
                examples: './prompts/gemini/examples.txt'
            },
            claude: {
                system: './prompts/claude/system.txt',
                context: './prompts/claude/context.txt',
                examples: './prompts/claude/examples.txt'
            }
        },
        shared: {
            templates: './prompts/shared/templates/',
            rules: './prompts/shared/rules.txt',
            constraints: './prompts/shared/constraints.txt'
        }
    }
};

// Конфигурация для загрузки промптов
const PROMPT_CONFIG = {
    autoReload: true, // Автоматическая перезагрузка промптов при изменении
    cacheTimeout: 3600, // Время кеширования промптов в секундах
    validateContent: true // Проверка содержимого промптов при загрузке
};

// Функция загрузки промпта
async function loadPrompt(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load prompt: ${path}`);
        return await response.text();
    } catch (error) {
        console.error(`Error loading prompt from ${path}:`, error);
        return null;
    }
}

// Функция получения системного промпта для модели
async function getSystemPrompt(model) {
    const modelConfig = BOT_PROMPTS.paths.models[model];
    if (!modelConfig) {
        console.error(`No prompt configuration found for model: ${model}`);
        return null;
    }

    const systemPrompt = await loadPrompt(modelConfig.system);
    const contextPrompt = await loadPrompt(modelConfig.context);
    const examplesPrompt = await loadPrompt(modelConfig.examples);

    return {
        system: systemPrompt,
        context: contextPrompt,
        examples: examplesPrompt
    };
}

// API конфигурация
window.GOOGLE_API_KEY = 'AIzaSyCT7omB5akHl3HhkFLNrzJtXWPNVjGaRW8';

// Verify API key is loaded
if (!window.GOOGLE_API_KEY) {
    console.error('API key is not configured!');
    throw new Error('API key is required');
}
