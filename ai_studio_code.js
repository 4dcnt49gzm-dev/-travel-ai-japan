/**
 * 旅栞 (TABISHIORI) フロントエンド・ロジック
 */

document.getElementById('generateBtn').addEventListener('click', generatePlan);
document.getElementById('copyBtn').addEventListener('click', copyToClipboard);

async function generatePlan() {
    const departure = document.getElementById('departure').value.trim();
    const companion = document.getElementById('companion').value;
    const budget = document.getElementById('budget').value;
    const days = document.getElementById('days').value;
    const purpose = document.getElementById('purpose').value.trim();

    // 簡単なバリデーション
    if (!departure || !purpose) {
        alert("出発地と旅行の目的を入力してください。");
        return;
    }

    // UIの初期化
    const loading = document.getElementById('loading');
    const resultArea = document.getElementById('result');
    const errorArea = document.getElementById('error-message');
    const generateBtn = document.getElementById('generateBtn');

    loading.classList.remove('hidden');
    resultArea.classList.add('hidden');
    errorArea.classList.add('hidden');
    generateBtn.disabled = true;

    try {
        // Vercel Serverless Functionを呼び出し
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ departure, companion, budget, days, purpose })
        });

        if (!response.ok) {
            throw new Error("プランの作成中にエラーが発生しました。");
        }

        const plan = await response.json();
        
        // データの描画
        renderPlan(plan);

    } catch (error) {
        console.error("Error generating plan:", error);
        errorArea.innerText = "申し訳ありません。プランの作成に失敗しました。時間をおいて再度お試しください。";
        errorArea.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
        generateBtn.disabled = false;
    }
}

/**
 * 受け取ったプランJSONをHTMLに反映する
 */
function renderPlan(plan) {
    document.getElementById('res-destination').innerText = plan.destination;
    document.getElementById('res-tagline').innerText = plan.tagline;

    // タイムライン描画
    const timeline = document.getElementById('res-timeline');
    timeline.innerHTML = '';
    plan.timeline.forEach(day => {
        // 日数ラベル
        const dayLabel = document.createElement('div');
        dayLabel.className = 'font-bold text-lg mb-6 mt-8 border-b pb-1 text-[#002B5B] serif';
        dayLabel.innerText = `第 ${day.day} 日`;
        timeline.appendChild(dayLabel);

        day.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item mb-6';
            div.innerHTML = `
                <span class="time-label">${item.time}</span>
                <p class="font-medium text-slate-800 text-sm md:text-base">${item.event}</p>
            `;
            timeline.appendChild(div);
        });
    });

    // スポットカード描画
    const spots = document.getElementById('res-spots');
    spots.innerHTML = plan.spots.map((spot, i) => {
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}`;
        const searchSuffix = spot.type === 'hotel' ? ' 宿泊予約' : ' 公式サイト';
        const infoUrl = `https://www.google.com/search?q=${encodeURIComponent(spot.name + searchSuffix)}`;
        const imgUrl = `https://loremflickr.com/600/400/japan,${encodeURIComponent(spot.type)}/all?lock=${i}`;

        return `
            <div class="spot-card shadow-sm flex flex-col rounded-lg overflow-hidden">
                <img src="${imgUrl}" class="spot-img" alt="${spot.name}" loading="lazy">
                <div class="p-6 flex-grow">
                    <span class="text-[10px] font-bold text-[#AF944F] uppercase tracking-widest">${spot.type}</span>
                    <h5 class="font-bold text-lg mb-2 text-slate-800 serif">${spot.name}</h5>
                    <p class="text-[11px] text-slate-500 leading-relaxed mb-4">${spot.description}</p>
                </div>
                <div class="p-4 pt-0 grid grid-cols-2 gap-2 no-print">
                    <a href="${mapUrl}" target="_blank" rel="noopener" class="text-center text-[10px] font-bold bg-slate-100 py-3 rounded hover:bg-slate-200 transition">MAP</a>
                    <a href="${infoUrl}" target="_blank" rel="noopener" class="text-center text-[10px] font-bold bg-[#002B5B] text-white py-3 rounded hover:bg-[#003e82] transition">詳細・予約</a>
                </div>
            </div>
        `;
    }).join('');

    // ポイントと持ち物
    document.getElementById('res-points').innerHTML = plan.points.map(p => `<p class="text-xs">・ ${p}</p>`).join('');
    document.getElementById('res-items').innerHTML = plan.items.map(i => `
        <span class="bg-slate-50 text-slate-600 px-4 py-2 rounded-full text-[10px] border border-slate-100 shadow-sm font-medium">${i}</span>
    `).join('');

    // 結果表示を可視化
    document.getElementById('result').classList.remove('hidden');
    window.scrollTo({ top: document.getElementById('result').offsetTop - 20, behavior: 'smooth' });
}

/**
 * 結果テキストをクリップボードにコピー
 */
async function copyToClipboard() {
    const text = document.getElementById('print-area').innerText;
    try {
        await navigator.clipboard.writeText(text);
        alert("旅のプランをコピーしました。");
    } catch (err) {
        alert("コピーに失敗しました。ブラウザの設定をご確認ください。");
    }
}