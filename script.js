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
    
    // 设置canvas尺寸为窗口大小
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // 初始化时调整大小
    resizeCanvas();
    
    // 窗口大小改变时重新调整
    window.addEventListener('resize', resizeCanvas);
    
    // 粒子参数 - 减少数量
    const particleCount = Math.min(30, window.innerWidth / 40); // 减少粒子数量
    const particles = [];
    
    // 创建粒子类
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5; // 更小的粒子
            this.speedX = Math.random() * 0.5 - 0.25; // 更慢的移动速度
            this.speedY = Math.random() * 0.5 - 0.25; // 更慢的移动速度
            this.opacity = Math.random() * 0.2 + 0.05; // 更透明
        }
        
        // 更新粒子位置
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // 边界反弹
            if (this.x > canvas.width || this.x < 0) {
                this.speedX = -this.speedX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.speedY = -this.speedY;
            }
        }
        
        // 绘制粒子
        draw() {
            const isDark = document.body.hasAttribute('data-theme');
            
            ctx.fillStyle = isDark ? 
                `rgba(255, 255, 255, ${this.opacity})` : 
                `rgba(0, 0, 0, ${this.opacity})`;
                
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 初始化粒子
    function initParticles() {
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // 动画循环
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 更新并绘制所有粒子
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            // 只在非常近的距离内绘制连线，且透明度更高
            connectParticlesMinimal(particles[i], particles);
        }
        
        requestAnimationFrame(animate);
    }
    
    // 最小化连接附近粒子
    function connectParticlesMinimal(p1, particles) {
        const maxDistance = 50; // 减少连线距离
        
        for (let i = 0; i < particles.length; i++) {
            const p2 = particles[i];
            if (p1 === p2) continue;
            
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                const opacity = 1 - (distance / maxDistance);
                const isDark = document.body.hasAttribute('data-theme');
                
                ctx.strokeStyle = isDark ? 
                    `rgba(255, 255, 255, ${opacity * 0.05})` : // 更透明的连线
                    `rgba(0, 0, 0, ${opacity * 0.05})`;        // 更透明的连线
                    
                ctx.lineWidth = 0.5; // 更细的线
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
}); 