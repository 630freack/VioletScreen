// Хранилище данных
let contentData = [];

// Загрузка данных из JSON-файла
async function loadContentData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        contentData = await response.json();
        console.log('Данные успешно загружены из data.json');
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        // Резервная загрузка из localStorage
        contentData = JSON.parse(localStorage.getItem('violetScreenContent')) || [];
        if (contentData.length === 0) {
            console.log('Используются демо-данные');
            initDemoContent();
        }
    }
}

// Элементы DOM
const loader = document.getElementById('loader');
const searchInput = document.getElementById('searchInput');
const navLinks = document.querySelectorAll('.nav a');
const cardsContainers = {
    popular: document.getElementById('popularCards'),
    new: document.getElementById('newCards'),
    trending: document.getElementById('trendingCards')
};

// Модальное окно плеера
const modal = document.getElementById('playerModal');
const closeModal = document.getElementById('closeModal');
const playerContainer = document.getElementById('playerContainer');

// Форма админ-панели
const addContentForm = document.getElementById('addContentForm');
const contentList = document.getElementById('contentList');

// Инициализация при загрузке
window.addEventListener('load', async () => {
    // Проверка наличия элементов перед работой с ними
    if (loader) {
        // Анимация загрузки
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 1000);
    } else {
        console.warn('Элемент loader не найден');
    }

    // Загрузка данных
    await loadContentData();

    // Обновление отображения
    if (typeof updateContentDisplay === 'function') {
        updateContentDisplay();
    }
    
    // Обновление списка контента (только на странице администратора)
    if (typeof updateContentList === 'function') {
        updateContentList();
    }
});

// Инициализация демо-контента
function initDemoContent() {
    contentData = [
        {
            id: Date.now() + 1,
            title: "Интерстеллар",
            type: "movie",
            genre: "Фантастика",
            rating: 9.0,
            description: "Команда исследователей путешествует через червоточину в поисках возможностей для выживания человечества.",
            poster: "https://via.placeholder.com/300x450/6a0dad/ffffff?text=Интерстеллар",
            video: "https://example.com/interstellar.mp4",
            section: "popular"
        },
        {
            id: Date.now() + 2,
            title: "Черное зеркало",
            type: "series",
            genre: "Фантастика",
            rating: 8.8,
            description: "Антропологическая фантастика, исследующая темную сторону современной жизни и технологий.",
            poster: "https://via.placeholder.com/300x450/6a0dad/ffffff?text=Черное+зеркало",
            video: "https://example.com/blackmirror.mp4",
            section: "popular"
        },
        {
            id: Date.now() + 3,
            title: "Врата Страны Оз",
            type: "anime",
            genre: "Фэнтези",
            rating: 8.5,
            description: "Молодая девушка попадает в волшебную страну, где начинаются удивительные приключения.",
            poster: "https://via.placeholder.com/300x450/6a0dad/ffffff?text=Врата+Страны+Оз",
            video: "https://example.com/oz.mp4",
            section: "new"
        },
        {
            id: Date.now() + 4,
            title: "Король Лев",
            type: "cartoon",
            genre: "Мюзикл",
            rating: 8.9,
            description: "История о молодом льве, который должен стать королем саванны.",
            poster: "https://via.placeholder.com/300x450/6a0dad/ffffff?text=Король+Лев",
            video: "https://example.com/lionking.mp4",
            section: "trending"
        }
    ];
    saveContent();
}

// Сохранение контента в localStorage
function saveContent() {
    localStorage.setItem('violetScreenContent', JSON.stringify(contentData));
    console.log('Данные сохранены в localStorage');
}

// Обновление отображения контента
function updateContentDisplay(filter = 'all', searchTerm = '') {
    // Очистка контейнеров
    Object.keys(cardsContainers).forEach(key => {
        cardsContainers[key].innerHTML = '';
    });

    // Фильтрация контента
    let filteredContent = contentData.filter(item => {
        const matchesFilter = filter === 'all' || item.type === filter;
        const matchesSearch = !searchTerm || 
                              item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.genre.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Если нет результатов поиска
    if (searchTerm && filteredContent.length === 0) {
        Object.keys(cardsContainers).forEach(key => {
            cardsContainers[key].innerHTML = '<p class="no-results">Ничего не найдено</p>';
        });
        return;
    }

    // Группировка по секциям
    const sections = {
        popular: [],
        new: [],
        trending: []
    };

    filteredContent.forEach(item => {
        if (sections[item.section]) {
            sections[item.section].push(item);
        }
    });

    // Отображение карточек
    Object.keys(sections).forEach(section => {
        sections[section].forEach(item => {
            const card = createCard(item);
            cardsContainers[section].appendChild(card);
        });
    });
}

// Создание карточки
function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <img src="${item.poster}" alt="${item.title}" class="card-img">
        <div class="card-content">
            <div class="card-title">${item.title}</div>
            <div class="card-info">
                <span class="rating">⭐ ${item.rating}</span>
                <span class="genre">${item.genre}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openPlayer(item));
    return card;
}

// Открытие плеера
function openPlayer(item) {
    modal.style.display = 'block';
    
    // Воспроизведение звука при открытии (опционально)
    // const audio = new Audio('sound/open.mp3');
    // audio.play().catch(e => console.log('Автовоспроизведение запрещено'));

    playerContainer.innerHTML = `
        <div class="video-container">
            <video controls class="video-player" poster="${item.poster}">
                <source src="${item.video}" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
            <div class="video-info">
                <h3>${item.title}</h3>
                <p class="video-description">${item.description}</p>
                <div class="video-meta">
                    <span>Рейтинг: ⭐ ${item.rating}</span>
                    <span>Жанр: ${item.genre}</span>
                    <span>Тип: ${getTypeLabel(item.type)}</span>
                </div>
            </div>
        </div>
    `;
}

// Закрытие плеера
if (closeModal && modal && playerContainer) {
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        // Остановка видео при закрытии
        const video = playerContainer.querySelector('video');
        if (video) {
            video.pause();
        }
        playerContainer.innerHTML = '';
    });
} else {
    console.warn('Элементы модального окна не найдены');
}

// Закрытие модального окна при клике вне контента
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal.click();
    }
});

// Поиск
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const activeFilter = getActiveFilter();
        updateContentDisplay(activeFilter, e.target.value);
    });
} else {
    console.warn('Элемент поиска не найден. Поиск недоступен на этой странице');
}

// Фильтрация по навигации
if (navLinks.length > 0) {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Обновление активного элемента
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Обновление отображения
            const filter = link.getAttribute('data-filter');
            updateContentDisplay(filter, searchInput ? searchInput.value : '');
        });
    });
} else {
    console.warn('Элементы навигации не найдены');
}

// Получение активного фильтра
function getActiveFilter() {
    const active = document.querySelector('.nav a.active');
    return active ? active.getAttribute('data-filter') : 'all';
}

// Метки типов
function getTypeLabel(type) {
    const labels = {
        'movie': 'Фильм',
        'series': 'Сериал',
        'anime': 'Аниме',
        'cartoon': 'Мультфильм'
    };
    return labels[type] || type;
}

// Админ-панель функционал
if (addContentForm) {
    addContentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(addContentForm);
        const newItem = {
            id: Date.now(),
            title: formData.get('title'),
            type: formData.get('type'),
            genre: formData.get('genre'),
            rating: parseFloat(formData.get('rating')),
            description: formData.get('description'),
            poster: formData.get('poster'),
            video: formData.get('video'),
            section: 'popular' // По умолчанию
        };
        
        contentData.push(newItem);
        saveContent();
        updateContentList();
        
        // Сброс формы
        addContentForm.reset();
        alert('Контент успешно добавлен!');
    });
} else {
    console.warn('Форма добавления контента не найдена. Убедитесь, что на странице есть элемент с id="addContentForm"');
}

// Обновление списка контента в админке
function updateContentList() {
    if (!contentList) {
        console.warn('Список контента не найден. Убедитесь, что на странице есть элемент с id="contentList"');
        return;
    }
    
    contentList.innerHTML = '';
    
    contentData.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'content-item';
        itemElement.innerHTML = `
            <div>
                <h4>${item.title}</h4>
                <p>${getTypeLabel(item.type)} • ${item.genre} • ⭐ ${item.rating}</p>
            </div>
            <button class="delete-btn" data-id="${item.id}">Удалить</button>
        `;
        
        contentList.appendChild(itemElement);
    });
    
    // Добавление обработчиков удаления
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            if (confirm('Вы уверены, что хотите удалить этот контент?')) {
                contentData = contentData.filter(item => item.id !== id);
                saveContent();
                updateContentList();
            }
        });
    });
}

// Инициализация начального состояния фильтров
const allFilter = document.querySelector('.nav a[data-filter="all"]');
if (allFilter) {
    allFilter.classList.add('active');
}