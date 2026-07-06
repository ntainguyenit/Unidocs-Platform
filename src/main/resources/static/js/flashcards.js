
        let cards = [];
        try {
            const stored = localStorage.getItem('unidocs_flashcards');
            if (stored) cards = JSON.parse(decodeURIComponent(atob(stored)));
        } catch(e) {
            try { cards = JSON.parse(localStorage.getItem('unidocs_flashcards')) || []; } catch(e){}
        }
        let currentIndex = 0;

        function saveCards() {
            localStorage.setItem('unidocs_flashcards', btoa(encodeURIComponent(JSON.stringify(cards))));
        }

        function updateUI() {
            if (cards.length === 0) {
                document.getElementById('learningArea').classList.add('hidden');
                document.getElementById('learningArea').classList.remove('flex');
                document.getElementById('emptyArea').classList.remove('hidden');
                document.getElementById('emptyArea').classList.add('flex');
                return;
            }

            document.getElementById('emptyArea').classList.add('hidden');
            document.getElementById('emptyArea').classList.remove('flex');
            document.getElementById('learningArea').classList.remove('hidden');
            document.getElementById('learningArea').classList.add('flex');

            document.getElementById('totalCards').innerText = cards.length;
            document.getElementById('currentCardIndex').innerText = currentIndex + 1;

            const card = cards[currentIndex];
            document.getElementById('frontText').innerText = card.question;
            document.getElementById('backText').innerText = card.answer;
            
            // Reset lật bài khi đổi thẻ mới
            document.getElementById('flashcard').classList.remove('flipped');
        }

        function flipCard() {
            document.getElementById('flashcard').classList.toggle('flipped');
        }

        function nextCard() {
            if (cards.length === 0) return;
            currentIndex = (currentIndex + 1) % cards.length;
            updateUI();
        }

        function prevCard() {
            if (cards.length === 0) return;
            currentIndex = (currentIndex - 1 + cards.length) % cards.length;
            updateUI();
        }

        function deleteCurrentCard() {
            if(confirm('Bạn muốn xóa thẻ này?')) {
                cards.splice(currentIndex, 1);
                if (currentIndex >= cards.length) {
                    currentIndex = Math.max(0, cards.length - 1);
                }
                saveCards();
                updateUI();
            }
        }

        document.getElementById('cardForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const question = document.getElementById('cardQuestion').value;
            const answer = document.getElementById('cardAnswer').value;

            if (question && answer) {
                cards.push({
                    question: question,
                    answer: answer
                });
                
                document.getElementById('cardQuestion').value = '';
                document.getElementById('cardAnswer').value = '';
                
                // Mới thêm thì chuyển đến thẻ đó
                currentIndex = cards.length - 1;
                saveCards();
                updateUI();
            }
        });

        // Hỗ trợ phím mũi tên
        document.addEventListener('keydown', function(e) {
            if(document.activeElement.tagName === 'TEXTAREA') return;
            
            if (e.key === 'ArrowRight') {
                nextCard();
            } else if (e.key === 'ArrowLeft') {
                prevCard();
            } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                flipCard();
            }
        });

        updateUI();
    

