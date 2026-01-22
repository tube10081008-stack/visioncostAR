export const Components = {
    onboarding: () => `
        <div id="view-onboarding" class="view">
            <div style="flex:1; overflow-y: auto; padding-bottom: 80px;" id="chat-container">
                <div class="chat-bubble">
                    안녕하세요! 당신의 쇼핑 네비게이터, 비전코스트(VisionCost)입니다.<br>
                    쇼핑 실패 없는 세상을 위해, 먼저 고객님의 피부 타입을 알려주세요. 😎
                </div>
                <!-- Dynamic Content Here -->
            </div>
            
            <div class="glass-panel" style="position: absolute; bottom: 24px; left: 24px; right: 24px;">
                <div id="input-area" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                    <!-- Input Buttons will appear here -->
                </div>
            </div>
        </div>
    `,

    scanner: () => `
        <div id="view-scanner" class="view">
            <!-- Camera Feed Placeholder -->
            <video id="camera-feed" autoplay playsinline style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; z-index: -1;"></video>
            
            <div style="position: absolute; top: 40px; right: 20px; z-index: 10;">
                <span class="material-icons-round" style="color:white; font-size: 28px;">flash_on</span>
            </div>

            <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <div style="width: 280px; height: 380px; border: 2px solid var(--primary-color); border-radius: 24px; position: relative; box-shadow: 0 0 20px var(--primary-dim);">
                    <!-- Corner Markers -->
                    <div style="position: absolute; top: -2px; left: -2px; width: 40px; height: 40px; border-top: 4px solid var(--primary-color); border-left: 4px solid var(--primary-color); border-radius: 20px 0 0 0;"></div>
                    <div style="position: absolute; top: -2px; right: -2px; width: 40px; height: 40px; border-top: 4px solid var(--primary-color); border-right: 4px solid var(--primary-color); border-radius: 0 20px 0 0;"></div>
                    <div style="position: absolute; bottom: -2px; left: -2px; width: 40px; height: 40px; border-bottom: 4px solid var(--primary-color); border-left: 4px solid var(--primary-color); border-radius: 0 0 0 20px;"></div>
                    <div style="position: absolute; bottom: -2px; right: -2px; width: 40px; height: 40px; border-bottom: 4px solid var(--primary-color); border-right: 4px solid var(--primary-color); border-radius: 0 0 20px 0;"></div>
                    
                    <!-- Scanline -->
                    <div style="width: 100%; height: 2px; background: var(--primary-color); box-shadow: 0 0 10px var(--primary-color); position: absolute; top: 50%; animation: scan 2s infinite ease-in-out;"></div>
                </div>
                <p style="margin-top: 20px; color: var(--primary-color); font-weight: 600; letter-spacing: 1px; background: rgba(0,0,0,0.6); padding: 8px 16px; border-radius: 20px;">성분 스캔 중... (꼼꼼하게 보는 중 👀)</p>
            </div>

            <div style="padding-bottom: 40px; display: flex; justify-content: center;">
                <button id="capture-btn" style="width: 72px; height: 72px; border-radius: 50%; background: transparent; border: 4px solid white; display:flex; align-items:center; justify-content:center; cursor: pointer;">
                    <div style="width: 60px; height: 60px; background: white; border-radius: 50%;"></div>
                </button>
            </div>
        </div>
        <style>
        @keyframes scan {
            0% { top: 10%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 90%; opacity: 0; }
        }
        </style>
    `,

    analysis: () => `
        <div id="view-analysis" class="view" style="justify-content: center; align-items: center; background: rgba(0,0,0,0.9); backdrop-filter: blur(20px);">
            <div style="text-align: center; position: relative;">
                <!-- Pulsing & Rotating Animation Container -->
                <div style="position: relative; width: 120px; height: 120px; margin: 0 auto 30px;">
                    <div class="pulse-ring"></div>
                    <div class="pulse-ring delay"></div>
                    
                    <!-- Rotating Ring -->
                    <div class="spin-ring"></div>

                    <div style="width: 100%; height: 100%; border-radius: 50%; background: var(--glass-bg); border: 2px solid var(--primary-color); display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; box-shadow: 0 0 20px var(--primary-dim);">
                        <span class="material-icons-round" style="font-size: 50px; color: var(--primary-color); animation: blink 3s infinite;">visibility</span>
                    </div>
                </div>

                <h2 style="font-size: 1.6rem; margin-bottom: 12px; color: white;">분석 중...</h2>
                <div id="analysis-step" style="font-size: 1.1rem; color: var(--primary-color); font-weight: 600; min-height: 24px; transition: opacity 0.5s;">제품을 뚫어져라 보는 중... 👀</div>
            </div>
        </div>
        <style>
        @keyframes blink { 
            0%, 90%, 100% { transform: scaleY(1); } 
            95% { transform: scaleY(0.1); } 
        }
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
        .pulse-ring {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            border-radius: 50%;
            border: 2px solid var(--primary-color);
            animation: pulse 2s linear infinite;
            opacity: 0;
        }
        .pulse-ring.delay { animation-delay: 1s; }
        .spin-ring {
            position: absolute;
            top: -15px; left: -15px; right: -15px; bottom: -15px;
            border-radius: 50%;
            border: 2px solid transparent;
            border-top: 2px solid var(--primary-color);
            border-right: 2px solid rgba(57, 255, 20, 0.3);
            animation: spin 3s linear infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(2); opacity: 0; }
        }
        </style>
    `,

    result: (data) => `
        <div id="view-result" class="view" style="display: block; overflow-y: auto; padding-bottom: 40px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button class="btn-glass" style="width: 40px; height: 40px; border-radius: 50%; padding:0; display:flex; align-items:center; justify-content:center;" onclick="window.location.reload()">
                    <span class="material-icons-round">arrow_back</span>
                </button>
                <span style="font-size: 0.9rem; color: var(--text-secondary);">분석 결과</span>
                <div style="width: 40px;"></div>
            </div>

            <div class="glass-panel" style="text-align: center; margin-bottom: 20px; border-color: ${data.color};">
                <span class="material-icons-round" style="font-size: 48px; color: ${data.color}; margin-bottom: 10px;">${data.icon}</span>
                <h1 style="font-size: 2.5rem; margin-bottom: 5px; color: ${data.color};">${data.score}</h1>
                <h3 style="margin-bottom: 10px;">${data.verdict}</h3>
                <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">${data.summary}</p>
            </div>

            <h3 style="margin-bottom: 12px;">주의 성분 감지됨</h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 30px;">
                ${data.triggers.map(t => `<span style="background: rgba(255, 59, 48, 0.15); color: #FF453A; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; border: 1px solid rgba(255, 59, 48, 0.3);">${t}</span>`).join('')}
                ${data.triggers.length === 0 ? '<span style="color: var(--text-secondary); font-size: 0.9rem;">발견되지 않음! 아주 깨끗해요 ✨</span>' : ''}
            </div>

            <h3 style="margin-bottom: 12px;">📊 리얼 리뷰 키워드 (Top 5)</h3>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 30px;">
                ${data.review_keywords ? data.review_keywords.map(k => `<span style="background: rgba(57, 255, 20, 0.1); color: #39FF14; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; border: 1px solid rgba(57, 255, 20, 0.3);">#${k}</span>`).join('') : '<span style="color: var(--text-secondary); font-size: 0.9rem;">리뷰 데이터가 부족합니다.</span>'}
            </div>

            <h3 style="margin-bottom: 12px;">더 나은 대체재 추천</h3>
            <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
                ${data.alternatives.map(alt => `
                    <div class="glass-panel" style="padding: 15px; display: flex; align-items: center; gap: 15px;">
                        <div style="width: 60px; height: 60px; background: #222; border-radius: 12px; display:flex; align-items:center; justify-content:center; flex-shrink: 0;">
                            <span class="material-icons-round" style="color: #444;">image</span>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <h4 style="font-size: 1rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${alt.name}</h4>
                            <span style="font-size: 0.85rem; color: var(--primary-color);">98% 성분 일치</span>
                        </div>
                        <span class="material-icons-round" style="color: var(--text-secondary);">chevron_right</span>
                    </div>
                `).join('')}
            </div>

            <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="window.location.reload()">
                다른 제품 스캔하기
            </button>
        </div>
    `
};
