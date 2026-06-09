const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupHeader() {
    const toggle = $('[data-menu-toggle]');
    const menu = $('[data-mobile-menu]');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('open');
        });
    }
    $$('[data-search-form]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            const input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
            }
        });
    });
}

function setupHero() {
    const hero = $('[data-hero]');
    if (!hero) return;
    const slides = $$('[data-hero-slide]', hero);
    const dots = $$('[data-hero-dot]', hero);
    const prev = $('[data-hero-prev]', hero);
    const next = $('[data-hero-next]', hero);
    if (!slides.length) return;
    let index = 0;
    let timer = null;
    const show = (target) => {
        index = (target + slides.length) % slides.length;
        slides.forEach((slide, idx) => slide.classList.toggle('active', idx === index));
        dots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
    };
    const start = () => {
        stop();
        timer = window.setInterval(() => show(index + 1), 5200);
    };
    const stop = () => {
        if (timer) window.clearInterval(timer);
    };
    prev && prev.addEventListener('click', () => {
        show(index - 1);
        start();
    });
    next && next.addEventListener('click', () => {
        show(index + 1);
        start();
    });
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            show(idx);
            start();
        });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
}

function setupFilters() {
    const panel = $('[data-filter-panel]');
    if (!panel) return;
    const cards = $$('[data-movie-card]');
    const keyword = $('[data-filter-keyword]', panel);
    const type = $('[data-filter-type]', panel);
    const region = $('[data-filter-region]', panel);
    const year = $('[data-filter-year]', panel);
    const reset = $('[data-filter-reset]', panel);
    const apply = () => {
        const q = (keyword?.value || '').trim().toLowerCase();
        const t = type?.value || '';
        const r = region?.value || '';
        const y = year?.value || '';
        cards.forEach((card) => {
            const hay = (card.dataset.title + ' ' + card.dataset.genre + ' ' + card.dataset.tags + ' ' + card.dataset.region + ' ' + card.dataset.type).toLowerCase();
            const okQ = !q || hay.includes(q);
            const okT = !t || card.dataset.type.includes(t);
            const okR = !r || card.dataset.region.includes(r);
            const okY = !y || card.dataset.year === y;
            card.classList.toggle('is-hidden', !(okQ && okT && okR && okY));
        });
    };
    [keyword, type, region, year].forEach((el) => {
        if (!el) return;
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
    });
    reset && reset.addEventListener('click', () => {
        if (keyword) keyword.value = '';
        if (type) type.value = '';
        if (region) region.value = '';
        if (year) year.value = '';
        apply();
    });
}

function cardMarkup(movie) {
    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `
        <a class="movie-card" href="${movie.url}" data-movie-card data-title="${escapeHtml(movie.title)}" data-type="${escapeHtml(movie.type)}" data-region="${escapeHtml(movie.region)}" data-year="${escapeHtml(movie.year)}" data-genre="${escapeHtml(movie.genre)}" data-tags="${escapeHtml((movie.tags || []).join(' '))}">
            <div class="poster-frame">
                <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
                <span class="card-badge">${escapeHtml(movie.type)}</span>
                <span class="card-year">${escapeHtml(movie.year)}</span>
            </div>
            <div class="card-body">
                <h2 class="card-title">${escapeHtml(movie.title)}</h2>
                <p class="card-desc">${escapeHtml(movie.one_line || movie.genre)}</p>
                <div class="card-meta">${tags}</div>
            </div>
        </a>`;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[char]));
}

async function setupSearchPage() {
    const root = $('[data-search-page]');
    if (!root) return;
    const form = $('[data-search-page-form]');
    const input = $('[data-search-page-input]');
    const results = $('[data-search-results]');
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    if (input) input.value = initial;
    let movies = [];
    const inlineData = $('#search-data');
    if (inlineData) {
        try {
            movies = JSON.parse(inlineData.textContent || '[]');
        } catch (error) {
            movies = [];
        }
    }
    if (!movies.length) {
        try {
            const response = await fetch('./assets/movies.json');
            movies = await response.json();
        } catch (error) {
            if (results) results.innerHTML = '<p class="info-card">暂时无法完成搜索，请稍后重试。</p>';
            return;
        }
    }
    const render = (query) => {
        const q = query.trim().toLowerCase();
        const list = q
            ? movies.filter((movie) => `${movie.title} ${movie.region} ${movie.type} ${movie.year} ${movie.genre} ${(movie.tags || []).join(' ')} ${movie.one_line || ''}`.toLowerCase().includes(q))
            : movies.slice(0, 48);
        if (!results) return;
        if (!list.length) {
            results.innerHTML = '<p class="info-card">没有找到匹配内容，换个关键词试试。</p>';
            return;
        }
        results.innerHTML = list.slice(0, 120).map(cardMarkup).join('');
    };
    form && form.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = input ? input.value : '';
        const url = new URL(window.location.href);
        if (query.trim()) url.searchParams.set('q', query.trim());
        else url.searchParams.delete('q');
        window.history.replaceState({}, '', url);
        render(query);
    });
    input && input.addEventListener('input', () => render(input.value));
    render(initial);
}

function setupPlayer() {
    const player = $('[data-player]');
    if (!player) return;
    const video = $('video', player);
    const cover = $('[data-play-cover]', player);
    const button = $('[data-play-button]', player);
    const errorBox = $('[data-player-error]', player);
    const dataNode = $('#player-config');
    if (!video || !dataNode) return;
    let videoUrl = '';
    let hlsInstance = null;
    let prepared = false;
    try {
        videoUrl = JSON.parse(dataNode.textContent || '{}').url || '';
    } catch (error) {
        videoUrl = '';
    }
    const showError = () => {
        if (errorBox) errorBox.classList.add('show');
    };
    const prepare = async () => {
        if (prepared || !videoUrl) return;
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
        } else {
            try {
                const mod = await import('./hls-vendor-dru42stk.js');
                const Hls = mod.H;
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(videoUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.ERROR, (event, details) => {
                        if (details && details.fatal) showError();
                    });
                } else {
                    video.src = videoUrl;
                }
            } catch (error) {
                video.src = videoUrl;
            }
        }
    };
    const play = async () => {
        if (cover) cover.classList.add('is-hidden');
        await prepare();
        try {
            await video.play();
        } catch (error) {
            if (cover) cover.classList.remove('is-hidden');
        }
    };
    button && button.addEventListener('click', play);
    cover && cover.addEventListener('click', play);
    video.addEventListener('click', () => {
        if (video.paused) play();
        else video.pause();
    });
    video.addEventListener('play', () => cover && cover.classList.add('is-hidden'));
    video.addEventListener('pause', () => {
        if (!video.ended && video.currentTime < 0.2 && cover) cover.classList.remove('is-hidden');
    });
    video.addEventListener('error', showError);
    window.addEventListener('beforeunload', () => {
        if (hlsInstance) hlsInstance.destroy();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupHeader();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayer();
});
