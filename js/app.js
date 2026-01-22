import { Components } from './components.js';

class App {
    constructor() {
        this.root = document.getElementById('app');
        this.state = {
            user: {
                skinType: null,
                concern: null,
                avoid: []
            },
            currentProduct: null
        };

        this.init();
    }

    init() {
        // Pseudo Splash Screen Delay
        setTimeout(() => {
            this.showOnboarding();
        }, 2000);
    }

    render(html) {
        // Keep splash if exists, append new view
        const existing = document.querySelector('.view');
        if (existing) existing.remove();

        const temp = document.createElement('div');
        temp.innerHTML = html;
        const newView = temp.firstElementChild;
        this.root.appendChild(newView);

        // Trigger reflow for transition
        setTimeout(() => newView.classList.add('active'), 50);
    }

    /* ================= ONBOARDING ================= */
    showOnboarding() {
        this.render(Components.onboarding());
        this.onboardingStep = 0;
        this.nextOnboardingStep();
    }

    nextOnboardingStep() {
        const container = document.getElementById('chat-container');
        const inputArea = document.getElementById('input-area');
        inputArea.innerHTML = '';

        const steps = [
            {
                q: "고객님의 현재 피부 타입은?",
                options: ['건성', '지성', '복합성', '민감성', '수부지', '아토피', '여드름성', '중성'],
                action: (val) => {
                    this.state.user.skinType = val;
                    this.addBubble(val, 'user');
                    this.onboardingStep++;
                    setTimeout(() => this.nextOnboardingStep(), 500);
                }
            },
            {
                q: "가장 큰 피부 고민은 무엇인가요?",
                options: ['여드름/트러블', '주름/탄력', '미백/잡티', '홍조', '모공/피지', '건조/속당김', '다크서클', '각질'],
                action: (val) => {
                    this.state.user.concern = val;
                    this.addBubble(val, 'user');
                    this.onboardingStep++;
                    setTimeout(() => this.nextOnboardingStep(), 500);
                }
            },
            {
                q: "절대 피하고 싶은 성분이 있나요?",
                options: ['알코올', '파라벤', '인공향료', '미네랄오일', '실리콘', '설페이트', 'PEG', '딱히 없음'],
                action: (val) => {
                    if (val !== '딱히 없음') this.state.user.avoid.push(val);
                    this.addBubble(val, 'user');
                    setTimeout(() => this.showScanner(), 1000);
                }
            }
        ];

        if (this.onboardingStep < steps.length) {
            const current = steps[this.onboardingStep];
            this.addBubble(current.q);

            current.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'btn';
                btn.textContent = opt;
                btn.onclick = () => current.action(opt);
                inputArea.appendChild(btn);
            });
        }
    }

    addBubble(text, type = 'bot') {
        const container = document.getElementById('chat-container');
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${type}`;
        bubble.innerHTML = text;
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
    }

    /* ================= SCANNER ================= */
    showScanner() {
        this.render(Components.scanner());
        this.startCamera();

        document.getElementById('capture-btn').onclick = () => {
            this.runAnalysis();
        };
    }

    async startCamera() {
        const video = document.getElementById('camera-feed');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                video.srcObject = stream;
            } catch (err) {
                console.error("Camera failed", err);
                // Fallback for desktop/no-cam
                video.style.background = '#222';
            }
        }
    }

    /* ================= ANALYSIS ================= */
    /* ================= ANALYSIS ================= */
    async runAnalysis() {
        try {
            // 1. Capture Image (MUST be done before switching view)
            const imageBlob = await this.captureImage();

            // Switch UI to Analysis Mode
            this.render(Components.analysis());

            const steps = [
                '제품을 노려보는 중... 👀',
                '전성분 털어보는 중... 🔍',
                '인터넷 리뷰 뒤지는 중... 🌐',
                '피부 타입과 매칭 중... 🧩',
                '최종 점수 계산 중... 🧮'
            ];
            const stepDisplay = document.getElementById('analysis-step');

            // Animation Loop
            let i = 0;
            const animationInterval = setInterval(() => {
                if (stepDisplay) {
                    // Fade Out
                    stepDisplay.style.opacity = '0.2';

                    setTimeout(() => {
                        // Change Text & Fade In
                        stepDisplay.textContent = steps[i];
                        stepDisplay.style.opacity = '1';
                        // Infinite Loop: (i + 1) % length
                        i = (i + 1) % steps.length;
                    }, 300);
                }
            }, 2000); // 2 seconds per message

            // 2. Prepare Data
            const formData = new FormData();
            formData.append('image', imageBlob, 'capture.jpg');
            formData.append('user_profile', JSON.stringify(this.state.user));

            // 3. Call Backend
            console.log("Sending request to backend...");

            // Determine API URL: Use absolute path for Localhost (to support Live Server), relative for Netlify
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiUrl = isLocal ? 'http://localhost:8000/analyze' : '/.netlify/functions/main/analyze';

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const resultData = await response.json();

            // Stop Animation and Show Result
            clearInterval(animationInterval);
            this.showResult(resultData);

        } catch (error) {
            console.error("Analysis Failed:", error);
            // If UI was already switched (e.g. error after capture), stop animation
            // If error happened during capture, we might still be in Scanner view or need to reset

            // Fallback for Demo if server is offline or capture failed
            console.log("Falling back to demo mode...");
            // Ensure we are in analysis view for the fallback experience or show error
            if (!document.getElementById('view-analysis')) {
                this.render(Components.analysis());
            }
            this.mockAnalysis();
        }
    }

    captureImage() {
        return new Promise((resolve, reject) => {
            const video = document.getElementById('camera-feed');
            if (!video) {
                reject("No camera feed found");
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject("Snapshot failed");
            }, 'image/jpeg', 0.8);
        });
    }

    mockAnalysis() {
        // ... (Simulate delay then show result)
        setTimeout(() => {
            this.showResult(null); // Trigger mock logic inside showResult
        }, 2000);
    }

    /* ================= RESULT ================= */
    showResult(apiData) {
        // Use API data if available, otherwise fall back to mock
        if (apiData) {
            this.render(Components.result(apiData));
            return;
        }

        // Mock Logic based on user state (Fallback)
        const isSensitive = this.state.user.skinType === '민감성';
        let score = 92;
        let verdict = "즉시 구매 추천! 🛍️";
        let color = "#39FF14"; // Safe
        let icon = "check_circle";
        let summary = "고객님의 피부 타입에 아주 잘 맞는 제품입니다. 병풀 추출물이 진정 효과를 줄 거예요.";
        let triggers = [];

        // Simulate a logic check
        if (isSensitive) {
            score = 45;
            verdict = "잠깐! 다시 생각해보세요 🚨";
            color = "#FF3B30"; // Danger (Red for sensitive)
            icon = "warning";
            summary = "알레르기 유발 가능성이 낮은 편이지만, 고농도 알코올이 포함되어 있어 민감성 피부에는 자극이 될 수 있습니다.";
            triggers = ['에탄올', '인공 향료'];
        }

        const resultData = {
            score,
            verdict,
            color,
            icon,
            summary,
            triggers,
            alternatives: [
                { name: '퓨어 시카 토너' },
                { name: '마일드 랩 세럼' }
            ]
        };

        this.render(Components.result(resultData));
    }
}

// Start App
window.visionCostApp = new App();
