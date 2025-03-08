document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 40,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 页面加载动画
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.opacity = '1';
    }
    
    // 滚动动画
    const features = document.querySelectorAll('.feature');
    
    function checkScroll() {
        features.forEach(feature => {
            const position = feature.getBoundingClientRect();
            
            if (position.top < window.innerHeight * 0.8) {
                feature.classList.add('fade-in');
            }
        });
    }
    
    // 初始检查
    setTimeout(checkScroll, 100);
    
    // 滚动时检查
    window.addEventListener('scroll', checkScroll);

    // 粒子背景动画
    const canvas = document.getElementById('particles-bg');
    const ctx = canvas.getContext('2d');
    
    // 修复全屏模式下canvas的问题
    function resizeCanvas() {
        // 获取当前视窗的尺寸，考虑全屏模式
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;
        
        // 检查canvas是否存在且尺寸是否需要更新
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            
            // 确保canvas样式也正确设置
            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;
            
            // 打印日志以便调试
            console.log(`Canvas resized to: ${displayWidth}x${displayHeight}`);
            
            return true; // 尺寸已更新
        }
        
        return false; // 尺寸未变
    }
    
    // 修复全屏切换的逻辑，确保canvas在全屏模式下正确显示
    function onFullScreenChange() {
        if (document.fullscreenElement || 
            document.webkitFullscreenElement || 
            document.mozFullScreenElement || 
            document.msFullscreenElement) {
            // 全屏模式激活
            fullscreenIcon.style.display = 'none';
            exitFullscreenIcon.style.display = 'block';
            
            // 确保canvas覆盖全屏区域
            setTimeout(() => {
                // 重新调整canvas尺寸
                resizeCanvas();
                
                // 确保canvas定位正确
                canvas.style.position = 'fixed';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.zIndex = '-1';
                
                // 重新初始化粒子以适应新的尺寸
                initParticles();
                
                // 尝试强制重绘
                requestAnimationFrame(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    particles.forEach(p => {
                        p.update();
                        if (p.isMeteor) {
                            drawMeteorTail(p);
                        }
                        p.draw();
                    });
                });
            }, 300); // 增加延迟，确保全屏模式完全生效
        } else {
            // 退出全屏模式
            fullscreenIcon.style.display = 'block';
            exitFullscreenIcon.style.display = 'none';
            
            // 重置为非全屏状态
            setTimeout(() => {
                // 重新调整canvas尺寸
                resizeCanvas();
                
                // 确保canvas定位正确
                canvas.style.position = 'fixed';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.zIndex = '-1';
                
                // 重新初始化粒子
                initParticles();
                
                // 强制重绘
                requestAnimationFrame(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    particles.forEach(p => {
                        p.update();
                        if (p.isMeteor) {
                            drawMeteorTail(p);
                        }
                        p.draw();
                    });
                });
            }, 300);
        }
    }
    
    // 为canvas添加CSS确保它在全屏模式下正确显示
    function setupCanvas() {
        // 确保canvas始终覆盖整个视图区域
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none'; // 让鼠标事件穿透canvas
        
        // 初始调整大小
        resizeCanvas();
    }
    
    // 初始化canvas设置
    setupCanvas();
    
    // 粒子参数 - 减少数量
    const particleCount = Math.min(30, window.innerWidth / 40); // 减少粒子数量
    const particles = [];
    
    // 创建粒子类
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.2; // 多样化的星星大小
            this.baseSize = this.size; // 记住原始大小用于闪烁效果
            
            // 非常慢的移动 - 几乎静止的星星
            this.speedX = Math.random() * 0.2 - 0.1;
            this.speedY = Math.random() * 0.2 - 0.1;
            
            // 星星的亮度属性
            this.opacity = Math.random() * 0.5 + 0.2;
            this.baseOpacity = this.opacity;
            
            // 闪烁效果参数
            this.twinkleSpeed = Math.random() * 0.01 + 0.005; // 闪烁速度
            this.twinkleDirection = Math.random() > 0.5 ? 1 : -1; // 闪烁方向
            
            // 每颗星星的色调变化
            this.hue = Math.random() > 0.9 ? 
                Math.random() * 60 + 200 : // 偶尔出现蓝色系星星
                0; // 大多是白色
            this.saturation = this.hue > 0 ? 80 : 0; // 有色调的话就增加饱和度
        }
        
        // 更新粒子位置和闪烁效果
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // 处理边界 - 为流星完全禁止环绕
            if (this.isMeteor) {
                // 流星不再处理边界循环，超出任何边界都标记为移除
                if (this.x > canvas.width * 1.2 || 
                    this.x < -canvas.width * 0.2 || 
                    this.y > canvas.height * 1.2) {
                    this.toRemove = true;
                }
            } else {
                // 普通星星的边界处理保持不变
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }
            
            // 增强闪烁效果 - 更大的变化幅度
            this.opacity += this.twinkleSpeed * this.twinkleDirection;
            this.size = this.baseSize * (0.8 + (this.opacity / this.baseOpacity) * 0.4); // 更大的尺寸变化
            
            // 反转闪烁方向，增加更大的亮度变化
            if (this.opacity > this.baseOpacity * 2 || this.opacity < this.baseOpacity * 0.4) {
                this.twinkleDirection *= -1;
            }
        }
        
        // 绘制星星
        draw() {
            const isDark = document.body.hasAttribute('data-theme') && 
                            document.body.getAttribute('data-theme') === 'dark';
            
            // 处理深色/浅色模式下的星星颜色
            let color;
            if (isDark) {
                // 深色模式: 明亮的星星
                if (this.hue > 0) {
                    color = `hsla(${this.hue}, ${this.saturation}%, 80%, ${this.opacity})`;
                } else {
                    color = `rgba(255, 255, 255, ${this.opacity})`;
                }
            } else {
                // 浅色模式: 蓝色系星星，而非黑色
                if (this.hue > 0) {
                    color = `hsla(${this.hue}, ${this.saturation}%, 50%, ${this.opacity * 0.7})`;
                } else {
                    // 使用淡蓝色而不是黑色
                    color = `rgba(50, 120, 255, ${this.opacity * 0.5})`;
                }
            }
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // 为较大的星星添加更明显的光晕效果
            if (this.baseSize > 1) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = color.replace(/[\d.]+\)$/, `${this.opacity * 0.2})`);
                ctx.fill();
            }
        }
    }
    
    // 初始化粒子
    function initParticles() {
        // 清空现有粒子
        particles.length = 0;
        
        // 创建更多粒子作为星星
        for (let i = 0; i < particleCount * 1.5; i++) {
            const star = new Particle();
            // 增强闪烁速度
            star.twinkleSpeed = Math.random() * 0.02 + 0.01; // 更快的闪烁
            particles.push(star);
        }
        
        // 添加一些特殊的大星星
        for (let i = 0; i < particleCount / 5; i++) {
            const brightStar = new Particle();
            brightStar.size = Math.random() * 2 + 1.5; // 更大的星星
            brightStar.opacity = Math.random() * 0.4 + 0.6; // 更亮的星星
            brightStar.twinkleSpeed = Math.random() * 0.03 + 0.01; // 闪烁速度
            brightStar.twinkleDirection = 1;
            particles.push(brightStar);
        }
    }
    
    // 新增流星效果
    function addMeteors() {
        // 初始添加几个流星
        for (let i = 0; i < 3; i++) {
            if (Math.random() > 0.5) {
                createRandomMeteor();
            }
        }
        
        // 更频繁地添加流星
        setInterval(() => {
            // 限制最大流星数量，防止过多流星影响性能
            const meteorCount = particles.filter(p => p.isMeteor).length;
            if (meteorCount < 5 && Math.random() > 0.5) { // 限制最多5个流星
                createRandomMeteor();
            }
        }, 4000);
    }
    
    // 创建随机位置和角度的流星
    function createRandomMeteor() {
        // 检查是否已存在太多粒子，避免内存泄漏
        if (particles.length > 500) {
            console.warn('Too many particles, skipping meteor creation');
            return null;
        }
        
        const meteor = new Particle();
        
        // 50%的概率从顶部开始，50%的概率从左侧或右侧开始
        const startPosition = Math.random();
        
        if (startPosition < 0.5) {
            // 从顶部开始
            meteor.x = Math.random() * canvas.width;
            meteor.y = -10;
            meteor.speedX = (Math.random() - 0.5) * 5; // 左右随机偏移
            meteor.speedY = Math.random() * 5 + 3; // 向下移动
        } else if (startPosition < 0.75) {
            // 从左侧开始
            meteor.x = -10;
            meteor.y = Math.random() * (canvas.height * 0.7); // 在上70%区域
            meteor.speedX = Math.random() * 3 + 2; // 向右移动
            meteor.speedY = Math.random() * 4 + 2; // 向下移动
        } else {
            // 从右侧开始
            meteor.x = canvas.width + 10;
            meteor.y = Math.random() * (canvas.height * 0.7); // 在上70%区域
            meteor.speedX = -(Math.random() * 3 + 2); // 向左移动
            meteor.speedY = Math.random() * 4 + 2; // 向下移动
        }
        
        meteor.size = Math.random() * 2 + 1;
        meteor.opacity = 0.7;
        meteor.isMeteor = true;
        meteor.tailLength = Math.random() * 20 + 15;
        meteor.prevPositions = [];
        
        particles.push(meteor);
        
        return meteor;
    }
    
    // 为流星添加尾巴效果
    function drawMeteorTail(meteor) {
        // 记录当前位置
        meteor.prevPositions.unshift({x: meteor.x, y: meteor.y});
        
        // 限制尾巴长度
        if (meteor.prevPositions.length > meteor.tailLength) {
            meteor.prevPositions.pop();
        }
        
        // 检查是否有足够的点来绘制尾巴
        if (meteor.prevPositions.length < 2) return;
        
        // 检查尾巴中是否有不合理的跳跃（水平或垂直方向）
        for (let i = 1; i < meteor.prevPositions.length; i++) {
            const current = meteor.prevPositions[i-1];
            const prev = meteor.prevPositions[i];
            const dx = current.x - prev.x;
            const dy = current.y - prev.y;
            
            // 如果两点之间的距离超过一定阈值，认为发生了"环绕"跳跃
            // 同时检测水平和垂直方向
            if (Math.abs(dx) > canvas.width * 0.4 || Math.abs(dy) > canvas.height * 0.4) {
                // 截断尾巴，只保留到这个点之前的部分
                meteor.prevPositions = meteor.prevPositions.slice(0, i);
                break;
            }
        }
        
        // 绘制尾巴
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        
        for (let i = 0; i < meteor.prevPositions.length; i++) {
            const pos = meteor.prevPositions[i];
            ctx.lineTo(pos.x, pos.y);
        }
        
        const isDark = document.body.hasAttribute('data-theme') && 
                       document.body.getAttribute('data-theme') === 'dark';
        
        // 创建渐变
        const gradient = ctx.createLinearGradient(
            meteor.x, meteor.y,
            meteor.prevPositions[meteor.prevPositions.length - 1].x,
            meteor.prevPositions[meteor.prevPositions.length - 1].y
        );
        
        // 根据主题调整流星尾巴颜色
        if (isDark) {
            gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else {
            // 浅色模式下使用蓝色调的流星，提高可见度
            gradient.addColorStop(0, `rgba(0, 110, 255, ${meteor.opacity})`);
            gradient.addColorStop(0.5, `rgba(50, 120, 255, ${meteor.opacity * 0.5})`);
            gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        }
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = meteor.size / (isDark ? 2 : 1.5); // 浅色模式下尾巴稍微粗一点
        ctx.stroke();
        
        // 为流星头部添加光晕效果
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.size * 2, 0, Math.PI * 2);
        if (isDark) {
            ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity * 0.3})`;
        } else {
            ctx.fillStyle = `rgba(0, 110, 255, ${meteor.opacity * 0.3})`;
        }
        ctx.fill();
    }
    
    // 动画循环
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 移除标记为删除的流星
        for (let i = particles.length - 1; i >= 0; i--) {
            if (particles[i].toRemove) {
                particles.splice(i, 1);
                continue;
            }
            
            particles[i].update();
            
            if (particles[i].isMeteor) {
                drawMeteorTail(particles[i]);
            }
            
            particles[i].draw();
            
            if (!particles[i].isMeteor) {
                connectParticlesMinimal(particles[i], particles);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // 最小化连接附近粒子
    function connectParticlesMinimal(p1, particles) {
        // 减少连线 - 只连接非常近的星星
        const maxDistance = 30; 
        let connections = 0;
        const maxConnections = 2; // 每颗星星最多连接数
        
        for (let i = 0; i < particles.length; i++) {
            if (connections >= maxConnections) break;
            
            const p2 = particles[i];
            if (p1 === p2) continue;
            
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                connections++;
                const opacity = (1 - (distance / maxDistance)) * 0.03;
                const isDark = document.body.hasAttribute('data-theme') && 
                              document.body.getAttribute('data-theme') === 'dark';
                
                ctx.strokeStyle = isDark ? 
                    `rgba(255, 255, 255, ${opacity})` : 
                    `rgba(0, 0, 0, ${opacity * 0.5})`;
                    
                ctx.lineWidth = 0.3; // 更细的连线
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
    
    // 鼠标交互
    let mouse = {
        x: null,
        y: null,
        radius: 150
    };
    
    window.addEventListener('mousemove', function(event) {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    
    // 初始化粒子并开始动画
    initParticles();
    addMeteors();
    animate();
    
    // 获取主题切换按钮和当前主题
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const notification = document.getElementById('theme-notification');
    const notificationText = document.getElementById('theme-notification-text');
    
    // 从localStorage获取用户偏好，如果没有则使用系统偏好
    const currentTheme = localStorage.getItem('theme');
    
    // 如果有保存的主题偏好，则应用它
    if (currentTheme) {
        document.body.setAttribute('data-theme', currentTheme);
    } else if (prefersDarkScheme.matches) {
        // 如果没有保存的偏好但系统偏好是暗色，则应用暗色主题
        document.body.setAttribute('data-theme', 'dark');
    }
    
    // 切换主题的函数
    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        let newTheme;
        
        // 添加按钮动画
        themeToggleBtn.classList.add('pulse');
        setTimeout(() => {
            themeToggleBtn.classList.remove('pulse');
        }, 500);
        
        if (currentTheme === 'dark') {
            newTheme = 'light';
            document.body.removeAttribute('data-theme');
            notificationText.textContent = '已切换到浅色模式';
        } else {
            newTheme = 'dark';
            document.body.setAttribute('data-theme', 'dark');
            notificationText.textContent = '已切换到深色模式';
        }
        
        // 显示通知
        notification.classList.add('show');
        
        // 3秒后隐藏通知
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
        
        // 保存用户的主题偏好
        localStorage.setItem('theme', newTheme);
    }
    
    // 初始加载时根据当前主题设置正确的通知文本
    const initialTheme = document.body.getAttribute('data-theme');
    if (initialTheme === 'dark') {
        notificationText.textContent = '深色模式';
    } else {
        notificationText.textContent = '浅色模式';
    }
    
    // 确保按钮点击事件使用更新后的函数
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // 监听系统主题变化
    prefersDarkScheme.addEventListener('change', function(e) {
        // 只有当用户没有明确设置偏好时才跟随系统
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.setAttribute('data-theme', 'dark');
            } else {
                document.body.removeAttribute('data-theme');
            }
        }
    });

    // 创建鼠标跟随效果
    const createMouseFollower = () => {
        const follower = document.createElement('div');
        follower.className = 'mouse-follower';
        document.body.appendChild(follower);
        
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        const links = document.querySelectorAll('a, button');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                follower.classList.add('link-hover');
            });
            link.addEventListener('mouseleave', () => {
                follower.classList.remove('link-hover');
            });
        });
        
        function animate() {
            // 平滑跟随算法
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            
            follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
            
            requestAnimationFrame(animate);
        }
        
        animate();
    };

    // 只在非触摸设备上启用
    if (!('ontouchstart' in window)) {
        createMouseFollower();
    }

    const loader = document.querySelector('.loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500);
    });

    // 增强弹窗打开/关闭动画效果
    function setupModals() {
        const aboutLink = document.getElementById('about-link');
        const contactLink = document.getElementById('contact-link');
        const aboutModal = document.getElementById('about-modal');
        const contactModal = document.getElementById('contact-modal');
        const closeButtons = document.querySelectorAll('.close-modal');
        
        // 添加动画效果
        function openModal(modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // 为"关于"弹窗中的元素添加入场动画
            if (modal === aboutModal) {
                const elements = modal.querySelectorAll('p, li');
                elements.forEach((el, index) => {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(20px)';
                    el.style.transition = `opacity 0.5s ease ${0.2 + index * 0.1}s, transform 0.5s ease ${0.2 + index * 0.1}s`;
                    
                    setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, 50);
                });
            }
            
            // 为"联系"弹窗中的联系方式添加入场动画
            if (modal === contactModal) {
                const items = modal.querySelectorAll('.contact-item');
                items.forEach((item, index) => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    item.style.transition = `opacity 0.5s ease ${0.2 + index * 0.1}s, transform 0.5s ease ${0.2 + index * 0.1}s`;
                    
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50);
                });
            }
        }
        
        function closeModal(modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
        
        // 打开关于弹窗
        aboutLink.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(aboutModal);
        });
        
        // 打开联系方式弹窗
        contactLink.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(contactModal);
        });
        
        // 关闭按钮
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                closeModal(aboutModal);
                closeModal(contactModal);
            });
        });
        
        // 点击弹窗外部关闭
        window.addEventListener('click', function(e) {
            if (e.target === aboutModal) {
                closeModal(aboutModal);
            }
            if (e.target === contactModal) {
                closeModal(contactModal);
            }
        });
        
        // ESC键关闭弹窗
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal(aboutModal);
                closeModal(contactModal);
            }
        });
    }

    // 设置弹窗功能
    setupModals();

    // 添加全屏切换功能
    function setupFullscreenToggle() {
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        const fullscreenIcon = document.querySelector('.fullscreen-icon');
        const exitFullscreenIcon = document.querySelector('.exit-fullscreen-icon');
        
        if (!fullscreenBtn) return;
        
        // 监听全屏状态变化
        document.addEventListener('fullscreenchange', onFullScreenChange);
        document.addEventListener('webkitfullscreenchange', onFullScreenChange);
        document.addEventListener('mozfullscreenchange', onFullScreenChange);
        document.addEventListener('MSFullscreenChange', onFullScreenChange);
        
        // 切换全屏状态
        fullscreenBtn.addEventListener('click', function() {
            if (!document.fullscreenElement && 
                !document.mozFullScreenElement && 
                !document.webkitFullscreenElement && 
                !document.msFullscreenElement) {
                // 进入全屏
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                }
            } else {
                // 退出全屏
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        });
    }

    // 在DOMContentLoaded事件中初始化全屏功能
    setupFullscreenToggle();

    // 修复域名波浪动画效果，保留原始渐变色
    function setupDomainWaveEffect() {
        // 获取域名元素
        const firstPart = document.querySelector('.domain-name .first');
        const lastPart = document.querySelector('.domain-name .last');
        
        if (!firstPart || !lastPart) return;
        
        // 获取原始文本和样式
        const firstText = firstPart.textContent;
        const lastText = lastPart.textContent;
        
        // 获取原有的样式（如渐变色）
        const computedStyleFirst = window.getComputedStyle(firstPart);
        const computedStyleLast = window.getComputedStyle(lastPart);
        
        // 保存原有的样式属性
        const originalStyles = {
            firstColor: computedStyleFirst.color,
            firstBackground: computedStyleFirst.background,
            firstBgClip: computedStyleFirst.webkitBackgroundClip || computedStyleFirst.backgroundClip,
            firstTextFillColor: computedStyleFirst.webkitTextFillColor,
            lastColor: computedStyleLast.color,
            lastBackground: computedStyleLast.background,
            lastBgClip: computedStyleLast.webkitBackgroundClip || computedStyleLast.backgroundClip,
            lastTextFillColor: computedStyleLast.webkitTextFillColor
        };
        
        // 清空原始内容
        firstPart.innerHTML = '';
        lastPart.innerHTML = '';
        
        // 为第一部分(ssss)创建单独的字母span，并保留原样式
        for (let i = 0; i < firstText.length; i++) {
            const letterSpan = document.createElement('span');
            letterSpan.className = 'wave-letter';
            letterSpan.textContent = firstText[i];
            letterSpan.style.animationDelay = `${i * 0.1}s`; // 错开动画时间
            
            // 应用原始样式到每个字母
            letterSpan.style.color = originalStyles.firstColor;
            letterSpan.style.background = originalStyles.firstBackground;
            if (originalStyles.firstBgClip) {
                letterSpan.style.webkitBackgroundClip = originalStyles.firstBgClip;
                letterSpan.style.backgroundClip = originalStyles.firstBgClip;
            }
            if (originalStyles.firstTextFillColor) {
                letterSpan.style.webkitTextFillColor = originalStyles.firstTextFillColor;
            }
            
            firstPart.appendChild(letterSpan);
        }
        
        // 为第二部分(ss)创建单独的字母span，并保留原样式
        for (let i = 0; i < lastText.length; i++) {
            const letterSpan = document.createElement('span');
            letterSpan.className = 'wave-letter';
            letterSpan.textContent = lastText[i];
            letterSpan.style.animationDelay = `${(firstText.length + i) * 0.1}s`; // 延续动画延迟
            
            // 应用原始样式到每个字母
            letterSpan.style.color = originalStyles.lastColor;
            letterSpan.style.background = originalStyles.lastBackground;
            if (originalStyles.lastBgClip) {
                letterSpan.style.webkitBackgroundClip = originalStyles.lastBgClip;
                letterSpan.style.backgroundClip = originalStyles.lastBgClip;
            }
            if (originalStyles.lastTextFillColor) {
                letterSpan.style.webkitTextFillColor = originalStyles.lastTextFillColor;
            }
            
            lastPart.appendChild(letterSpan);
        }
    }

    // 在DOM加载完成后调用
    setupDomainWaveEffect();

    // 在页面加载时动态更新资源版本
    function addVersionToResources() {
        const timestamp = new Date().getTime();
        
        // 为所有CSS添加版本
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            if (!link.href.includes('?v=')) {
                link.href = link.href + '?v=' + timestamp;
            }
        });
        
        // 为所有JS添加版本(除了当前脚本)
        document.querySelectorAll('script').forEach(script => {
            if (script.src && !script.src.includes('?v=') && 
                !script.src.includes('script.js')) {
                script.src = script.src + '?v=' + timestamp;
            }
        });
    }
    
    // 在需要强制刷新资源时调用
    // addVersionToResources();
}); 