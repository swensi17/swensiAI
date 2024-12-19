// Initialize Google Generative AI
async function initializeAI() {
    if (!window.GOOGLE_API_KEY) {
        throw new Error('API key is not configured');
    }

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro?key=' + window.GOOGLE_API_KEY, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('API request failed: ' + response.statusText);
        }

        return true;
    } catch (error) {
        console.error('Error initializing AI:', error);
        throw error;
    }
}

// Chat elements
const messagesContainer = document.querySelector('.messages-container');
const messageInput = document.querySelector('.message-input');
const sendButton = document.querySelector('.send-button');
const clearButton = document.querySelector('.clear-button');
const typingIndicator = document.querySelector('.typing-indicator');
const suggestionChips = document.querySelectorAll('.suggestion-chip');
const themeButton = document.querySelector('.theme-button');

// Theme handling
let isDarkTheme = true;
themeButton.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('light-theme');
    themeButton.querySelector('.theme-icon').textContent = isDarkTheme ? '🌙' : '☀️';
});

// Initialize chat model
let isInitialized = false;
let chatHistory = [];

function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = content;
    
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    
    // Прокрутка к последнему сообщению
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Обновляем время последнего ответа
    if (sender === 'bot') {
        lastResponseTime = Date.now();
    }
}

async function generateAIResponse(message) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + window.GOOGLE_API_KEY, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: message
                }]
            }]
        })
    });

    if (!response.ok) {
        throw new Error('API request failed: ' + response.statusText);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format');
    }

    return data.candidates[0].content.parts[0].text;
}

async function sendMessage(message) {
    if (!message.trim()) {
        console.error('Cannot send empty message');
        return;
    }

    try {
        // Show user message
        addMessage(message, 'user');
        messageInput.value = '';
        messageInput.style.height = 'auto';

        // Show typing indicator
        typingIndicator.style.display = 'flex';

        // Generate AI response
        const response = await generateAIResponse(message);

        // Hide typing indicator and show AI response
        typingIndicator.style.display = 'none';
        addMessage(response, 'bot');

    } catch (error) {
        console.error('Error sending message:', error);
        typingIndicator.style.display = 'none';
        addMessage('Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.', 'system');
    }
}

// Event listeners
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(messageInput.value);
    }
});

sendButton.addEventListener('click', () => {
    sendMessage(messageInput.value);
});

clearButton.addEventListener('click', () => {
    messagesContainer.innerHTML = '';
    chatHistory = [];
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        const newWelcome = welcomeMessage.cloneNode(true);
        messagesContainer.appendChild(newWelcome);
    }
});

suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
        messageInput.value = chip.textContent;
        sendMessage(chip.textContent);
    });
});

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Инициализация highlight.js
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
});

// Функция для форматирования кода
function formatCode(code, language = 'python') {
    return `<pre><code class="language-${language}">${code}</code></pre>`;
}

function formatCapabilities() {
    return `
        <div class="main-text fade-in">Я могу помочь вам во многих вещах, в том числе:</div>

        <div class="section-header">Информация и факты</div>
        <ul class="capability-list">
            <li class="capability-item">Предоставлять информацию по широкому кругу тем.</li>
            <li class="capability-item">Отвечать на конкретные вопросы о текущих событиях, науке, истории и т. д.</li>
        </ul>

        <div class="section-header">Задачи</div>
        <ul class="capability-list">
            <li class="capability-item">Выполнять простые математические задачи.</li>
            <li class="capability-item">Конвертировать единицы измерения.</li>
            <li class="capability-item">Предоставлять определения и синонимы.</li>
        </ul>

        <div class="section-header">Перевод</div>
        <ul class="capability-list">
            <li class="capability-item">Переводить текст и фразы на более чем 100 языков.</li>
        </ul>

        <div class="section-header">Творчество</div>
        <ul class="capability-list">
            <li class="capability-item">Создавать рассказы, стихи и песни по запросу.</li>
            <li class="capability-item">Предоставлять идеи для проектов и занятий.</li>
        </ul>

        <div class="section-header">Продуктивность</div>
        <ul class="capability-list">
            <li class="capability-item">Устанавливать напоминания и будильники.</li>
            <li class="capability-item">Предоставлять обновления погоды и новостей.</li>
            <li class="capability-item">Переводить язык на язык жестов.</li>
        </ul>

        <div class="section-header">Обучение</div>
        <ul class="capability-list">
            <li class="capability-item">Определять и объяснять научные понятия.</li>
            <li class="capability-item">Предоставлять образовательные ресурсы по различным предметам.</li>
            <li class="capability-item">Помогать с домашними заданиями и пониманием.</li>
        </ul>

        <div class="section-header">Отдых и развлечения</div>
        <ul class="capability-list">
            <li class="capability-item">Проигрывать музыку, рассказывать анекдоты и играть в игры.</li>
            <li class="capability-item">Предоставлять гороскопы, прогнозы на погоду и курсы акций.</li>
            <li class="capability-item">Рекомендовать фильмы, книги и подкасты.</li>
        </ul>

        <div class="main-text fade-in">
            Кроме того, я постоянно обучаюсь и улучшаю свои возможности. По мере развития я смогу помогать вам в новых и захватывающих вещах.
            <br><br>
            Сообщите мне, как я могу конкретно помочь вам сегодня.
        </div>
    `;
}

function formatPythonExample() {
    return `
        <div class="code-section">
            <div class="section-title">Hello World на Python</div>
            <div class="python-code">
<span class="py-keyword">def</span> <span class="py-function">hello_world</span>():
    <span class="py-triple-quotes">"""</span>
    <span class="py-docstring">This function prints "Hello, World!" to the console.</span>
    <span class="py-triple-quotes">"""</span>
    <span class="py-keyword">print</span>(<span class="py-string">"Hello, World!"</span>)

<span class="py-keyword">def</span> <span class="py-function">main</span>():
    <span class="py-triple-quotes">"""</span>
    <span class="py-docstring">This is the main function.</span>
    <span class="py-triple-quotes">"""</span>
    hello_world()

<span class="py-keyword">if</span> __name__ == <span class="py-string">"__main__"</span>:
    main()</div>
        </div>
    `;
}

function formatRectangleExample() {
    return `
        <div class="code-section">
            <div class="section-title">Класс Rectangle на Python</div>
            <div class="python-code">
<span class="py-comment"># Rectangle class</span>
<span class="py-keyword">class</span> <span class="py-class">Rectangle</span>:
    <span class="py-comment"># Private properties</span>
    <span class="py-keyword">def</span> <span class="py-function">__init__</span>(self, width: <span class="py-class">float</span>, height: <span class="py-class">float</span>):
        self._width = width
        self._height = height
    
    <span class="py-comment"># Getters</span>
    <span class="py-keyword">def</span> <span class="py-function">get_width</span>(self) -> <span class="py-class">float</span>:
        <span class="py-keyword">return</span> self._width
    
    <span class="py-keyword">def</span> <span class="py-function">get_height</span>(self) -> <span class="py-class">float</span>:
        <span class="py-keyword">return</span> self._height
    
    <span class="py-comment"># Setters</span>
    <span class="py-keyword">def</span> <span class="py-function">set_width</span>(self, width: <span class="py-class">float</span>) -> <span class="py-keyword">None</span>:
        self._width = width
    
    <span class="py-keyword">def</span> <span class="py-function">set_height</span>(self, height: <span class="py-class">float</span>) -> <span class="py-keyword">None</span>:
        self._height = height
    
    <span class="py-comment"># Area calculation</span>
    <span class="py-keyword">def</span> <span class="py-function">get_area</span>(self) -> <span class="py-class">float</span>:
        <span class="py-keyword">return</span> self._width * self._height
    
    <span class="py-comment"># Perimeter calculation</span>
    <span class="py-keyword">def</span> <span class="py-function">get_perimeter</span>(self) -> <span class="py-class">float</span>:
        <span class="py-keyword">return</span> 2 * (self._width + self._height)
    
    <span class="py-comment"># Check if the rectangle is a square</span>
    <span class="py-keyword">def</span> <span class="py-function">is_square</span>(self) -> <span class="py-class">bool</span>:
        <span class="py-keyword">return</span> self._width == self._height</div>
        </div>
    `;
}

function formatSecurityExample() {
    return `
        <div class="code-section">
            <div class="section-title">Пример сканирования портов на Python</div>
            <div class="python-code">
<span class="py-keyword">import</span> socket
<span class="py-keyword">import</span> threading
<span class="py-keyword">from</span> queue <span class="py-keyword">import</span> Queue

<span class="py-comment"># Target configuration</span>
target = <span class="py-string">"example.com"</span>
queue = Queue()
open_ports = []

<span class="py-comment"># Port scanner function</span>
<span class="py-keyword">def</span> <span class="py-function">port_scan</span>(port):
    <span class="py-keyword">try</span>:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((target, port))
        <span class="py-keyword">if</span> result == 0:
            open_ports.append(port)
        sock.close()
    <span class="py-keyword">except</span>:
        <span class="py-keyword">pass</span>

<span class="py-comment"># Thread worker</span>
<span class="py-keyword">def</span> <span class="py-function">worker</span>():
    <span class="py-keyword">while</span> <span class="py-keyword">not</span> queue.empty():
        port = queue.get()
        port_scan(port)
        queue.task_done()

<span class="py-comment"># Main scanning function</span>
<span class="py-keyword">def</span> <span class="py-function">run_scanner</span>(start_port, end_port, num_threads):
    <span class="py-keyword">for</span> port <span class="py-keyword">in</span> <span class="py-function">range</span>(start_port, end_port + 1):
        queue.put(port)
    
    threads = []
    <span class="py-keyword">for</span> _ <span class="py-keyword">in</span> <span class="py-function">range</span>(num_threads):
        thread = threading.Thread(target=worker)
        thread.daemon = True
        thread.start()
        threads.append(thread)
    
    queue.join()
    
    <span class="py-keyword">return</span> open_ports</div>
        </div>
    `;
}

// Примеры профессиональных скриптов
const securityScripts = {
    networkAnalysis: `
<div class="code-section">
    <div class="section-title">Анализ сетевого трафика на Python</div>
    <div class="python-code">
<span class="py-keyword">from</span> scapy.all <span class="py-keyword">import</span> *
<span class="py-keyword">import</span> logging
<span class="py-keyword">import</span> datetime

<span class="py-keyword">class</span> <span class="py-class">NetworkAnalyzer</span>:
    <span class="py-keyword">def</span> <span class="py-function">__init__</span>(self, interface=<span class="py-string">"eth0"</span>):
        self.interface = interface
        self.packets = []
        self.setup_logging()
    
    <span class="py-keyword">def</span> <span class="py-function">setup_logging</span>(self):
        logging.basicConfig(
            filename=<span class="py-string">f"network_analysis_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.log"</span>,
            level=logging.INFO,
            format=<span class="py-string">'%(asctime)s - %(levelname)s - %(message)s'</span>
        )
    
    <span class="py-keyword">def</span> <span class="py-function">packet_callback</span>(self, packet):
        <span class="py-keyword">if</span> packet.haslayer(IP):
            self.packets.append(packet)
            self.analyze_packet(packet)
    
    <span class="py-keyword">def</span> <span class="py-function">analyze_packet</span>(self, packet):
        <span class="py-keyword">try</span>:
            src_ip = packet[IP].src
            dst_ip = packet[IP].dst
            protocol = packet[IP].proto
            
            <span class="py-comment"># Анализ протокола</span>
            <span class="py-keyword">if</span> packet.haslayer(TCP):
                src_port = packet[TCP].sport
                dst_port = packet[TCP].dport
                flags = packet[TCP].flags
                self.analyze_tcp(src_ip, dst_ip, src_port, dst_port, flags)
            
            <span class="py-keyword">elif</span> packet.haslayer(UDP):
                self.analyze_udp(packet)
            
            <span class="py-keyword">elif</span> packet.haslayer(ICMP):
                self.analyze_icmp(packet)
            
        <span class="py-keyword">except</span> Exception <span class="py-keyword">as</span> e:
            logging.error(<span class="py-string">f"Error analyzing packet: {e}"</span>)
    
    <span class="py-keyword">def</span> <span class="py-function">analyze_tcp</span>(self, src_ip, dst_ip, src_port, dst_port, flags):
        <span class="py-comment"># Анализ подозрительных TCP-соединений</span>
        suspicious = <span class="py-keyword">False</span>
        reason = []
        
        <span class="py-keyword">if</span> flags & 0x02 <span class="py-keyword">and</span> dst_port <span class="py-keyword">in</span> [22, 23, 3389]:  <span class="py-comment"># SYN на критичные порты</span>
            suspicious = <span class="py-keyword">True</span>
            reason.append(<span class="py-string">"Попытка подключения к критичному порту"</span>)
        
        <span class="py-keyword">if</span> suspicious:
            logging.warning(
                <span class="py-string">f"Подозрительное TCP-соединение:\n"</span>
                <span class="py-string">f"Источник: {src_ip}:{src_port}\n"</span>
                <span class="py-string">f"Назначение: {dst_ip}:{dst_port}\n"</span>
                <span class="py-string">f"Причина: {', '.join(reason)}"</span>
            )
    
    <span class="py-keyword">def</span> <span class="py-function">start_capture</span>(self, timeout=None):
        logging.info(<span class="py-string">f"Starting packet capture on interface {self.interface}"</span>)
        sniff(
            iface=self.interface,
            prn=self.packet_callback,
            timeout=timeout
        )
        
    <span class="py-keyword">def</span> <span class="py-function">generate_report</span>(self):
        <span class="py-comment"># Генерация отчета о сетевой активности</span>
        report = {
            <span class="py-string">"total_packets"</span>: len(self.packets),
            <span class="py-string">"protocols"</span>: {},
            <span class="py-string">"top_talkers"</span>: {},
            <span class="py-string">"suspicious_activity"</span>: []
        }
        
        <span class="py-keyword">return</span> report

<span class="py-comment"># Пример использования</span>
<span class="py-keyword">if</span> __name__ == <span class="py-string">"__main__"</span>:
    analyzer = NetworkAnalyzer()
    analyzer.start_capture(timeout=60)  <span class="py-comment"># Захват трафика в течение 60 секунд</span>
    report = analyzer.generate_report()
    logging.info(<span class="py-string">f"Analysis complete. Found {report['total_packets']} packets."</span>)</div>
</div>`,

    systemAudit: `
<div class="code-section">
    <div class="section-title">Скрипт аудита безопасности системы</div>
    <div class="python-code">
<span class="py-keyword">import</span> os
<span class="py-keyword">import</span> subprocess
<span class="py-keyword">import</span> platform
<span class="py-keyword">import</span> json
<span class="py-keyword">from</span> datetime <span class="py-keyword">import</span> datetime

<span class="py-keyword">class</span> <span class="py-class">SecurityAuditor</span>:
    <span class="py-keyword">def</span> <span class="py-function">__init__</span>(self):
        self.system = platform.system()
        self.results = {
            <span class="py-string">"timestamp"</span>: datetime.now().isoformat(),
            <span class="py-string">"system_info"</span>: {},
            <span class="py-string">"security_checks"</span>: {},
            <span class="py-string">"vulnerabilities"</span>: []
        }
    
    <span class="py-keyword">def</span> <span class="py-function">check_system_info</span>(self):
        self.results[<span class="py-string">"system_info"</span>] = {
            <span class="py-string">"os"</span>: platform.platform(),
            <span class="py-string">"architecture"</span>: platform.architecture(),
            <span class="py-string">"python_version"</span>: platform.python_version(),
            <span class="py-string">"hostname"</span>: platform.node()
        }
    
    <span class="py-keyword">def</span> <span class="py-function">check_open_ports</span>(self):
        <span class="py-keyword">try</span>:
            <span class="py-keyword">if</span> self.system == <span class="py-string">"Linux"</span>:
                cmd = [<span class="py-string">"ss"</span>, <span class="py-string">"-tuln"</span>]
            <span class="py-keyword">else</span>:
                cmd = [<span class="py-string">"netstat"</span>, <span class="py-string">"-an"</span>]
            
            output = subprocess.check_output(cmd).decode()
            self.results[<span class="py-string">"security_checks"</span>][<span class="py-string">"open_ports"</span>] = output
        <span class="py-keyword">except</span> Exception <span class="py-keyword">as</span> e:
            self.results[<span class="py-string">"security_checks"</span>][<span class="py-string">"open_ports"</span>] = <span class="py-string">f"Error: {str(e)}"</span>
    
    <span class="py-keyword">def</span> <span class="py-function">check_system_updates</span>(self):
        <span class="py-keyword">try</span>:
            <span class="py-keyword">if</span> self.system == <span class="py-string">"Linux"</span>:
                output = subprocess.check_output([<span class="py-string">"apt"</span>, <span class="py-string">"list"</span>, <span class="py-string">"--upgradable"</span>]).decode()
            <span class="py-keyword">else</span>:
                output = <span class="py-string">"System update check not implemented for this OS"</span>
            
            self.results[<span class="py-string">"security_checks"</span>][<span class="py-string">"system_updates"</span>] = output
        <span class="py-keyword">except</span> Exception <span class="py-keyword">as</span> e:
            self.results[<span class="py-string">"security_checks"</span>][<span class="py-string">"system_updates"</span>] = <span class="py-string">f"Error: {str(e)}"</span>
    
    <span class="py-keyword">def</span> <span class="py-function">check_firewall_status</span>(self):
        <span class="py-keyword">try</span>:
            <span class="py-keyword">if</span> self.system == <span class="py-string">"Linux"</span>:
                output = subprocess.check_output([<span class="py-string">"ufw"</span>, <span class="py-string">"status"</span>]).decode()
            <span class="py-keyword">else</span>:
                output = subprocess.check_output([<span class="py-string">"netsh"</span>, <span class="py-string">"advfirewall"</span>, <span class="py-string">"show"</span>, <span class="py-string">"currentprofile"</span>]).decode()
            
            self.results[<span class="py-string">"security_checks"</span>][<span class="py-string">"firewall_status"</span>] = output
        <span class="py-keyword">except</span> Exception <span class="py-keyword">as</span> e:
            self.results[<span class="py-string">"security_checks"</span>][<span class="py-string">"firewall_status"</span>] = <span class="py-string">f"Error: {str(e)}"</span>
    
    <span class="py-keyword">def</span> <span class="py-function">run_full_audit</span>(self):
        self.check_system_info()
        self.check_open_ports()
        self.check_system_updates()
        self.check_firewall_status()
        
        <span class="py-keyword">return</span> self.results

<span class="py-comment"># Пример использования</span>
<span class="py-keyword">if</span> __name__ == <span class="py-string">"__main__"</span>:
    auditor = SecurityAuditor()
    results = auditor.run_full_audit()
    
    <span class="py-keyword">with</span> open(<span class="py-string">"security_audit_report.json"</span>, <span class="py-string">"w"</span>) <span class="py-keyword">as</span> f:
        json.dump(results, f, indent=4)</div>
</div>`
};

// Функция для определения типа запроса по кибербезопасности
function detectSecurityTopic(message) {
    const topics = {
        network: ["сеть", "трафик", "пакеты", "мониторинг", "анализ сети"],
        system: ["аудит", "система", "уязвимости", "проверка", "безопасность системы"],
        web: ["веб", "сайт", "приложение", "инъекции", "xss"],
        forensics: ["форензика", "расследование", "восстановление", "анализ данных"],
        crypto: ["шифрование", "ключи", "хеширование", "криптография"]
    };
    
    message = message.toLowerCase();
    for (let [topic, keywords] of Object.entries(topics)) {
        if (keywords.some(keyword => message.includes(keyword))) {
            return topic;
        }
    }
    return null;
}

// Обновляем обработчик сообщений
function processMessage(message) {
    const topic = detectSecurityTopic(message);
    
    if (topic === "network") {
        return securityScripts.networkAnalysis;
    }
    
    if (topic === "system") {
        return securityScripts.systemAudit;
    }
    
    // Генерируем подсказки на основе специализаций
    const suggestions = [];
    for (let [area, details] of Object.entries(window.BOT_CONFIG.specializations)) {
        suggestions.push(`Могу помочь с ${details.topics.join(", ")}`);
        suggestions.push(`Расскажу про инструменты: ${details.tools.join(", ")}`);
    }
    
    return `Я специализируюсь на кибербезопасности. Вот что я могу предложить:\n\n${suggestions.join("\n")}`;
}

// Специализированные подсказки по кибербезопасности
const securitySuggestions = [
    "Хотите узнать о методах анализа сетевого трафика?",
    "Могу показать, как провести аудит безопасности системы",
    "Расскажу о современных методах защиты от атак",
    "Интересует анализ уязвимостей веб-приложений?",
    "Давайте обсудим инструменты мониторинга безопасности",
    "Могу поделиться скриптами для автоматизации проверок"
];

let lastResponseTime = 0;
const RESPONSE_TIMEOUT = 30000; // 30 секунд

function checkForContinuation() {
    const currentTime = Date.now();
    if (currentTime - lastResponseTime > RESPONSE_TIMEOUT) {
        const suggestion = securitySuggestions[Math.floor(Math.random() * securitySuggestions.length)];
        addMessage(suggestion, 'bot');
        lastResponseTime = currentTime;
    }
}

// Обновляем интервал проверки
setInterval(checkForContinuation, 5000);

// Initialize chat when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing CyberSec AI...');
        addMessage(`${window.BOT_CONFIG.name} v${window.BOT_CONFIG.version} готов к работе.\nСпециализация: кибербезопасность, пентестинг, анализ угроз.\nВведите команду или задайте вопрос.`, 'system');
        isInitialized = true;
    } catch (error) {
        console.error('Initialization error:', error);
        addMessage('Ошибка инициализации. Проверьте консоль для деталей.', 'system');
    }
});

// Функция для создания заголовка вопроса
function createQuestionHeader(text) {
    const header = document.createElement('div');
    header.className = 'question-header';
    header.textContent = text;
    return header;
}

// Функция для добавления вопросов
function addQuestions(questions) {
    const container = document.querySelector('.messages-container');
    
    questions.forEach((question, index) => {
        setTimeout(() => {
            const header = createQuestionHeader(question);
            container.appendChild(header);
        }, index * 200); // Добавляем задержку для каскадной анимации
    });
}

// Пример использования
const securityQuestions = [
    'Интересует анализ уязвимостей веб-приложений?',
    'Хотите узнать о защите от SQL-инъекций?',
    'Интересна тема безопасности API?'
];

// Конфигурация моделей
const AI_MODELS = {
    'gemini-2-flash': {
        name: 'Gemini 2.0 Flash',
        description: 'Экспериментальная версия с мультимодальными возможностями',
        icon: '⚡',
        maxTokens: 128000, // Поддержка >128K токенов
        temperature: 0.9,
        features: {
            multimodal: true,
            codeProcessing: true,
            nativeTools: true
        },
        limits: {
            rateLimit: '10 RPM',
            pricing: {
                under128k: '$0.00',
                over128k: '$0.00'
            },
            latency: 'Низкая',
            knowledgeCutoff: 'Август 2024'
        },
        capabilities: [
            'Обработка 10,000 строк кода',
            'Нативное использование инструментов',
            'Генерация текста и изображений',
            'Мультимодальное понимание'
        ]
    },
    'gemini-pro': {
        name: 'Gemini Pro',
        description: 'Стабильная версия для большинства задач',
        icon: '🚀',
        maxTokens: 32768,
        temperature: 0.8
    },
    'gemini-ultra': {
        name: 'Gemini Ultra',
        description: 'Максимальная мощность для сложных задач',
        icon: '🌟',
        maxTokens: 65536,
        temperature: 0.7
    }
};

// Настройки для подробных ответов
const RESPONSE_SETTINGS = {
    minWords: 200,
    includeExamples: true,
    includeExplanations: true,
    formatOutput: true,
    multimodalSupport: true
};

// Добавляем кнопку выбора модели
function addModelSelector() {
    const header = document.querySelector('.chat-header');
    
    // Удаляем кнопку смены темы, если она есть
    const themeButton = header.querySelector('.theme-toggle');
    if (themeButton) {
        themeButton.remove();
    }
    
    const selector = document.createElement('div');
    selector.className = 'model-selector';
    
    // Создаем кнопку
    const button = document.createElement('button');
    button.className = 'model-select-btn';
    button.innerHTML = `
        <span class="current-model">
            ${AI_MODELS['gemini-2-flash'].icon} ${AI_MODELS['gemini-2-flash'].name}
        </span>
        <span class="model-arrow">▼</span>
    `;
    
    // Создаем выпадающий список
    const dropdown = document.createElement('div');
    dropdown.className = 'model-dropdown';
    
    // Добавляем модели в список
    Object.entries(AI_MODELS).forEach(([id, model]) => {
        const option = document.createElement('div');
        option.className = 'model-option';
        option.dataset.modelId = id;
        option.innerHTML = `
            <span class="model-icon">${model.icon}</span>
            <div class="model-info">
                <div class="model-name">${model.name}</div>
                <div class="model-description">${model.description}</div>
            </div>
        `;
        
        option.addEventListener('click', () => selectModel(id));
        dropdown.appendChild(option);
    });
    
    // Добавляем обработчик для открытия/закрытия списка
    button.addEventListener('click', () => {
        dropdown.classList.toggle('show');
        button.classList.toggle('active');
    });
    
    // Закрываем список при клике вне его
    document.addEventListener('click', (e) => {
        if (!selector.contains(e.target)) {
            dropdown.classList.remove('show');
            button.classList.remove('active');
        }
    });
    
    selector.appendChild(button);
    selector.appendChild(dropdown);
    header.appendChild(selector);
}

// Функция выбора модели с расширенными возможностями
function selectModel(modelId) {
    const model = AI_MODELS[modelId];
    if (!model) return;
    
    // Обновляем кнопку
    const button = document.querySelector('.model-select-btn');
    button.querySelector('.current-model').innerHTML = `${model.icon} ${model.name}`;
    
    // Закрываем dropdown
    document.querySelector('.model-dropdown').classList.remove('show');
    button.classList.remove('active');
    
    // Обновляем конфигурацию с учетом особенностей модели
    window.BOT_CONFIG = {
        ...window.BOT_CONFIG,
        currentModel: modelId,
        maxTokens: model.maxTokens,
        temperature: model.temperature,
        features: model.features || {},
        limits: model.limits || {},
        capabilities: model.capabilities || [],
        responseSettings: {
            ...RESPONSE_SETTINGS,
            multimodalSupport: model.features?.multimodal || false
        }
    };
    
    // Показываем расширенное уведомление
    showModelActivationNotice(model);
}

// Функция для показа расширенного уведомления об активации модели
function showModelActivationNotice(model) {
    // Показываем уведомление
    showNotification(`${model.icon} Модель ${model.name} активирована`);
    
    // Добавляем системное сообщение с подробной информацией
    let modelInfo = `
    🔄 Переключение на модель ${model.name}
    
    📊 Характеристики модели:
    • Максимальная длина: ${model.maxTokens.toLocaleString()} токенов
    • Температура: ${model.temperature}
    ${model.limits ? `
    ⚙️ Ограничения:
    • Запросов в минуту: ${model.limits.rateLimit}
    • Стоимость (до 128K): ${model.limits.pricing.under128k}
    • Стоимость (после 128K): ${model.limits.pricing.over128k}
    • Актуальность данных: ${model.limits.knowledgeCutoff}
    ` : ''}
    ${model.capabilities ? `
    💪 Возможности:
    ${model.capabilities.map(cap => '• ' + cap).join('\n')}
    ` : ''}
    
    ✨ Модель готова к работе и настроена на предоставление подробных ответов с примерами и пояснениями.
    `;
    
    addMessage(modelInfo, 'system');
}

// Обновляем обработчик сообщений для более подробных ответов
function processMessage(message) {
    const currentModel = AI_MODELS[window.BOT_CONFIG.currentModel];
    
    // Применяем настройки модели
    const context = {
        model: currentModel,
        settings: RESPONSE_SETTINGS,
        maxTokens: currentModel.maxTokens,
        temperature: currentModel.temperature
    };
    
    // Генерируем подробный ответ
    return generateDetailedResponse(message, context);
}

// Функция для генерации подробных ответов
function generateDetailedResponse(message, context) {
    let response = '';
    
    if (context.settings.includeExplanations) {
        response += generateTheoryAndConcepts(message);
    }
    
    if (context.settings.includeExamples) {
        response += generatePracticalExamples(message);
    }
    
    if (context.settings.formatOutput) {
        response = formatResponseWithMarkdown(response);
    }
    
    return response;
}

// Функция для показа уведомлений
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Удаление уведомления
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    addModelSelector();
});

// Функция форматирования ответа
async function handleMessage(message) {
    try {
        const model = AI_MODELS[window.BOT_CONFIG.currentModel];
        
        // Добавляем сообщение пользователя в историю
        conversationContext.history.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Формируем контекст из последних сообщений
        const recentContext = conversationContext.history
            .slice(-conversationContext.contextWindow)
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');

        // Получаем ответ с учетом контекста
        let response = await getModelResponse(message, model, recentContext);

        // Добавляем ответ бота в историю
        conversationContext.history.push({
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        });

        // Ограничиваем размер истории
        if (conversationContext.history.length > conversationContext.maxHistoryLength) {
            conversationContext.history = conversationContext.history
                .slice(-conversationContext.maxHistoryLength);
        }

        // Сохраняем историю в localStorage
        saveConversationHistory();

        // Форматируем ответ
        response = cleanTextResponse(response);
        response = formatCodeBlocks(response);

        return response;
    } catch (error) {
        console.error('Error in handleMessage:', error);
        return 'Произошла ошибка при обработке сообщения. Пожалуйста, попробуйте еще раз.';
    }
}

// Сохранение истории разговора
function saveConversationHistory() {
    try {
        localStorage.setItem('conversationHistory', 
            JSON.stringify(conversationContext.history));
    } catch (error) {
        console.error('Error saving conversation history:', error);
    }
}

// Загрузка истории разговора
function loadConversationHistory() {
    try {
        const savedHistory = localStorage.getItem('conversationHistory');
        if (savedHistory) {
            conversationContext.history = JSON.parse(savedHistory);
        }
    } catch (error) {
        console.error('Error loading conversation history:', error);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadConversationHistory();
});

// Хранилище контекста для каждой сессии
const conversationContext = {
    history: [],
    maxHistoryLength: 50, // Максимальное количество сообщений в истории
    contextWindow: 10 // Количество последних сообщений для контекста
};

// Очистка текста от символов форматирования
function cleanTextResponse(text) {
    return text
        .replace(/^\s*\*+/gm, '') // Удаляем звездочки в начале строк
        .replace(/\*\*(.*?)\*\*/g, '$1') // Удаляем двойные звездочки
        .replace(/\*(.*?)\*/g, '$1') // Удаляем одиночные звездочки
        .replace(/_{2,}/g, '') // Удаляем множественные подчеркивания
        .replace(/\s{2,}/g, ' ') // Заменяем множественные пробелы на один
        .trim();
}

// Форматирование блоков кода с подсветкой синтаксиса
function formatCodeBlocks(response) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    
    return response.replace(codeBlockRegex, (match, language, code) => {
        // Определяем язык программирования
        const lang = language || detectLanguage(code);
        
        // Форматируем код с подсветкой синтаксиса
        return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
    });
}

// Определение языка программирования
function detectLanguage(code) {
    if (code.includes('function') || code.includes('const') || code.includes('let')) {
        return 'javascript';
    } else if (code.includes('class') && code.includes('def')) {
        return 'python';
    } else if (code.includes('<?php')) {
        return 'php';
    } else if (code.includes('<html>') || code.includes('<!DOCTYPE')) {
        return 'html';
    } else if (code.includes('{') && code.includes('}') && code.includes(';')) {
        return 'css';
    }
    return 'plaintext';
}
