const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'music-player'
const player = $('.player')
const playList = $('.playlist')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd');
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Vì mẹ bắt anh chia tay",
            singer: "Miu Lê",
            path: "./assets/musics/miule.mp3",
            image: "./assets/images/miule.jpg"
        },
        {
            name: "Tệ thật, anh nhớ em",
            singer: "Thanh Hưng",
            path: "./assets/musics/thanhhuong.mp3",
            image: "./assets/images/thanhhung.jpg"
        },
        {
            name: "Hai mươi hai",
            singer: "Hứa Kim Tuyền, AMEE",
            path: "./assets/musics/huakimtuyen.mp3",
            image: "./assets/images/huakimtuyen.jpg"
        },
        {
            name: "Một ngàn nỗi đau",
            singer: "Văn Mai Hương, Hứa Kim Tuyền",
            path: "./assets/musics/vanmaihuong.mp3",
            image: "./assets/images/vanmaihuong.jpg"
        },
        {
            name: "Đế Vương",
            singer: "Đình Dũng",
            path: "./assets/musics/dinhdung.mp3",
            image: "./assets/images/dinhdung.jpg"
        },
        {
            name: "Yêu đương khó quá thì chạy về khóc với anh",
            singer: "ERIK",
            path: "./assets/musics/erik.mp3",
            image: "./assets/images/erik.jpg"
        },
        {
            name: "Ánh sao và bầu trời",
            singer: "T.R.I",
            path: "./assets/musics/tri.mp3",
            image: "./assets/images/Tri.jpg"
        },
        {
            name: "là do em xui thôi",
            singer: "Khói",
            path: "./assets/musics/khoi.mp3",
            image: "./assets/images/khoi.jpg"
        },
        {
            name: "Chạy khỏi thế giới này",
            singer: "DA LAB, Phương LY",
            path: "./assets/musics/phuongly.mp3",
            image: "./assets/images/phuongly.jpg"
        },
        {
            name: "Từng Thương",
            singer: "Phan Duy Anh",
            path: "./assets/musics/phanduyanh.mp3",
            image: "./assets/images/phanduyanh.jpg"
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playList.innerHTML = htmls.join('');

    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        //xử lý cd quay/ dừng
        const cdThumbAnimate = cdThumb.animate([
            {
                transform: "rotate(360deg)",
            }], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        });

        cdThumbAnimate.pause();

        //xử lý phóng to thu nhỏ CD
        document.onscroll = () => {
            const scrollTop = document.documentElement.scrollTop || window.scrollY;
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;

        }

        //Xử lý khi click Play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }

        }
        //khi audio dang playing
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play();
        }
        // khi audio đang Pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause();
        }
        //khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = progressPercent;
            }
        }

        //Xử lý next song khi audio ended
        audio.onended = () => {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
            _this.render()
            _this.scrollToActiveSong();
        }
        //xử lý khi tua bài hát
        progress.onchange = (e) => {
            const seekTime = (audio.duration / 100) * e.target.value;

            audio.currentTime = seekTime
        }
        // xử lý xự kiện Next
        nextBtn.onclick = () => {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong();
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong();
        }
        // xử lý sự kiện Prev
        prevBtn.onclick = () => {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.prevSong();
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong();
        }
        // xử lý sự kiện random bài hát
        randomBtn.onclick = () => {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        //xử lý sự kiện khi repeat được bật
        repeatBtn.onclick = () => {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //Lắng nghe hành vi click vào PlayList
        playList.onclick = (e) => {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                //Xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render()
                    audio.play()
                }
                // xử lý khi click vào song option
                if (e.target.closest('.option')) {

                }
            }
        }

    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    randomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong()
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest"
            });
        }, 300)
    },
    loadCurrentSong: function () {


        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path


    },
    start: function () {
        // load config
        this.loadConfig()

        //Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        //Lắng nghe/xử lý các sự kiện (Dom Event)
        this.handleEvents()

        //Tải bài hát hiện tại
        this.loadCurrentSong()

        //Render lại danh sach bài hát
        this.render()

        //Hiển thi config 
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }

}

app.start()