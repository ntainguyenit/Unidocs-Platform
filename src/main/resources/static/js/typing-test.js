
        const rawParagraphs = [
            "Công nghệ thông tin là một ngành học cực kỳ năng động và phát triển với tốc độ chóng mặt. Những người theo đuổi lĩnh vực này cần phải không ngừng học hỏi, cập nhật các kiến thức mới về ngôn ngữ lập trình, hệ quản trị cơ sở dữ liệu và trí tuệ nhân tạo. Việc gõ phím nhanh là một kỹ năng cơ bản và vô cùng cần thiết đối với mỗi lập trình viên.",
            "Trường Đại học Khoa học, Đại học Huế là một trong những trung tâm đào tạo và nghiên cứu khoa học lớn của miền Trung. Sinh viên tại đây luôn được tạo điều kiện tốt nhất để phát huy khả năng sáng tạo và học tập. Khả năng làm việc nhóm và giao tiếp cũng là những kỹ năng mềm quan trọng giúp các bạn tiến xa hơn trên con đường sự nghiệp.",
            "Ngày nay, việc sở hữu một chiếc máy tính cá nhân kết nối Internet đã mở ra vô vàn cơ hội học tập. Khắp nơi trên thế giới, hàng triệu dòng mã được viết ra mỗi ngày để xây dựng những phần mềm, ứng dụng giúp cuộc sống trở nên tiện lợi hơn. Bạn có bao giờ tự hỏi làm cách nào để gõ phím nhanh mà không cần nhìn bàn phím chưa?",
            "Lập trình viên không chỉ là những người viết ra mã máy, mà họ còn là những nghệ sĩ thực thụ. Bằng cách sắp xếp các câu lệnh logic, họ biến những ý tưởng vô hình thành những sản phẩm hữu hình hiện diện trên mọi thiết bị. Thật thú vị khi có thể giao tiếp với máy tính và bắt chúng thực hiện chính xác những gì mình muốn.",
            "Hệ điều hành Windows, Linux hay macOS đều có những ưu điểm và khuyết điểm riêng biệt. Việc lựa chọn môi trường phát triển phụ thuộc rất nhiều vào thói quen và tính chất công việc của từng cá nhân. Một lập trình viên giỏi là người có thể linh hoạt thích nghi với bất kỳ hệ thống nào.",
            "Cơ sở dữ liệu đóng vai trò cốt lõi trong mọi ứng dụng hiện đại. Từ những trang web nhỏ cho đến các hệ thống thương mại điện tử khổng lồ, tất cả đều cần đến SQL hoặc NoSQL để lưu trữ và truy xuất thông tin một cách an toàn và nhanh chóng nhất.",
            "An toàn thông tin và bảo mật mạng đang trở thành mối quan tâm hàng đầu của các doanh nghiệp. Mỗi ngày có hàng ngàn cuộc tấn công mạng diễn ra, đòi hỏi các chuyên gia bảo mật phải luôn cảnh giác và cập nhật hệ thống phòng thủ liên tục để bảo vệ dữ liệu người dùng."
        ];

        let timeLimit = 60;
        let timeLeft;
        let timer;
        let isPlaying = false;
        let charIndex = 0;
        let mistakes = 0;
        let isTestFinished = false;
        let hasStarted = false;

        const textDisplay = document.getElementById('textDisplay');
        const timeDisplay = document.getElementById('timeDisplay');
        const wpmDisplay = document.getElementById('wpmDisplay');
        const accuracyDisplay = document.getElementById('accuracyDisplay');
        const restartBtn = document.getElementById('restartBtn');
        const resultOverlay = document.getElementById('resultOverlay');
        const finalWpm = document.getElementById('finalWpm');
        const finalAcc = document.getElementById('finalAcc');
        const startOverlay = document.getElementById('startOverlay');
        const startTypingBtn = document.getElementById('startTypingBtn');

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function loadParagraph() {
            const ranIndex = Math.floor(Math.random() * rawParagraphs.length);
            let words = rawParagraphs[ranIndex].split(" ");
            words = shuffleArray(words);
            const text = words.join(" ") + " ";
            
            textDisplay.innerHTML = "";
            text.split("").forEach(char => {
                let span = `<span class="char">${char}</span>`;
                textDisplay.innerHTML += span;
            });
            textDisplay.querySelectorAll("span")[0].classList.add("current");
        }

        function initTest() {
            loadParagraph();
            clearInterval(timer);
            timeLeft = timeLimit;
            charIndex = 0;
            mistakes = 0;
            isPlaying = false;
            isTestFinished = false;
            hasStarted = false;
            timeDisplay.innerText = timeLeft;
            wpmDisplay.innerText = 0;
            accuracyDisplay.innerText = 100;
            resultOverlay.classList.add('hidden');
            startOverlay.classList.remove('hidden');
        }

        startTypingBtn.addEventListener('click', () => {
            hasStarted = true;
            startOverlay.classList.add('hidden');
            textDisplay.focus();
        });

        function handleInput(e) {
            if (isTestFinished || !hasStarted) return;
            
            // Ignore modifiers
            if(["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Escape"].includes(e.key)) return;
            
            // Prevent default scrolling for Spacebar and other keys
            if (e.key === " " || e.key === "Backspace" || e.key.length === 1) {
                e.preventDefault();
            }

            if (!isPlaying) {
                timer = setInterval(updateTimer, 1000);
                isPlaying = true;
            }

            const characters = textDisplay.querySelectorAll("span");
            
            if (e.key === "Backspace") {
                if (charIndex > 0) {
                    charIndex--;
                    if (characters[charIndex].classList.contains("incorrect")) {
                        mistakes--;
                    }
                    characters[charIndex].classList.remove("correct", "incorrect", "current");
                    characters[charIndex].classList.add("current");
                    if(charIndex + 1 < characters.length) {
                        characters[charIndex + 1].classList.remove("current");
                    }
                }
            } else {
                if (charIndex < characters.length) {
                    let typedChar = e.key;
                    // handle special case if typedChar length > 1 but we only process valid chars
                    if(typedChar.length !== 1) return;

                    let expectedChar = characters[charIndex].innerText;
                    
                    if (typedChar === expectedChar) {
                        characters[charIndex].classList.add("correct");
                    } else {
                        mistakes++;
                        characters[charIndex].classList.add("incorrect");
                    }
                    characters[charIndex].classList.remove("current");
                    charIndex++;
                    if (charIndex < characters.length) {
                        characters[charIndex].classList.add("current");
                    } else {
                        finishTest(); // Reached end of text
                    }
                }
            }

            // Real-time calculation
            let wpm = Math.round((((charIndex - mistakes) / 5) / (timeLimit - timeLeft)) * 60);
            wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
            
            let accuracy = Math.round(((charIndex - mistakes) / charIndex) * 100);
            accuracy = accuracy < 0 || !accuracy ? 100 : accuracy;

            wpmDisplay.innerText = wpm;
            accuracyDisplay.innerText = accuracy;
        }

        function updateTimer() {
            if (timeLeft > 0) {
                timeLeft--;
                timeDisplay.innerText = timeLeft;
            } else {
                finishTest();
            }
        }

        function finishTest() {
            clearInterval(timer);
            isTestFinished = true;
            
            // Final calculation
            let timeElapsed = timeLimit - timeLeft;
            if(timeElapsed === 0) timeElapsed = 1;
            
            let wpm = Math.round((((charIndex - mistakes) / 5) / timeElapsed) * 60);
            wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
            
            let accuracy = Math.round(((charIndex - mistakes) / charIndex) * 100);
            accuracy = accuracy < 0 || !accuracy ? 0 : accuracy;

            finalWpm.innerText = wpm;
            finalAcc.innerText = accuracy + "%";
            resultOverlay.classList.remove('hidden');
        }

        textDisplay.addEventListener("keydown", handleInput);
        restartBtn.addEventListener("click", initTest);
        
        // click textDisplay to focus
        textDisplay.addEventListener("click", () => textDisplay.focus());

        // Initialize on load
        initTest();
    

