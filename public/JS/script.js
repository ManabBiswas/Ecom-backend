        // Modal functions
        function openLoginModal() {
            document.getElementById('loginModal').classList.remove('hidden');
            document.getElementById('loginModal').classList.add('flex');
        }

        function closeLoginModal() {
            document.getElementById('loginModal').classList.add('hidden');
            document.getElementById('loginModal').classList.remove('flex');
        }

        function openRegisterModal() {
            document.getElementById('registerModal').classList.remove('hidden');
            document.getElementById('registerModal').classList.add('flex');
        }

        function closeRegisterModal() {
            document.getElementById('registerModal').classList.add('hidden');
            document.getElementById('registerModal').classList.remove('flex');
        }

        function toggleMobileMenu() {
            const menu = document.getElementById('mobileMenu');
            menu.classList.toggle('hidden');
        }

        // Form handling
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.target.submit();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.target.submit();
        });

        // Close modals when clicking outside
        document.getElementById('loginModal').addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') {
                closeLoginModal();
            }
        });

        document.getElementById('registerModal').addEventListener('click', (e) => {
            if (e.target.id === 'registerModal') {
                closeRegisterModal();
            }
        });
        // Set current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();