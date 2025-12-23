class SorteioRifa {
    constructor() {
        // Estado do sorteio
        this.numerosRifa = Array.from({length: 200}, (_, i) => i + 1);
        this.numerosSorteados = [];
        this.numerosDisponiveis = [...this.numerosRifa];
        
        // Elementos DOM
        this.numeroSorteadoEl = document.getElementById('numeroSorteado');
        this.statusSorteioEl = document.getElementById('statusSorteio');
        this.sorteadosCountEl = document.getElementById('sorteadosCount');
        this.disponiveisCountEl = document.getElementById('disponiveisCount');
        this.progressoPercentEl = document.getElementById('progressoPercent');
        this.progressBarEl = document.getElementById('progressBar');
        this.totalSorteadosEl = document.getElementById('totalSorteados');
        this.numerosSorteadosEl = document.getElementById('numerosSorteados');
        
        // Controles
        this.btnSortear = document.getElementById('btnSortear');
        this.btnResetar = document.getElementById('btnResetar');
        this.btnExportar = document.getElementById('btnExportar');
        this.btnCopiar = document.getElementById('btnCopiar');
        
        // Modal
        this.modal = document.getElementById('confirmModal');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalCancel = document.getElementById('modalCancel');
        this.modalConfirm = document.getElementById('modalConfirm');
        
        // Toast
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
        
        // Estado
        this.sorteando = false;
        this.animacaoStep = 0;
        
        // Inicializar
        this.init();
    }
    
    init() {
        // Event Listeners
        this.btnSortear.addEventListener('click', () => this.iniciarSorteio());
        this.btnResetar.addEventListener('click', () => this.confirmarReset());
        this.btnExportar.addEventListener('click', () => this.exportarResultados());
        this.btnCopiar.addEventListener('click', () => this.copiarLista());
        
        // Modal listeners
        this.modalCancel.addEventListener('click', () => this.fecharModal());
        this.modalConfirm.addEventListener('click', () => {
            this.realizarReset();
            this.fecharModal();
        });
        
        // Fechar modal ao clicar fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.fecharModal();
            }
        });
        
        // Atualizar estado inicial
        this.atualizarEstado();
    }
    
    iniciarSorteio() {
        if (this.sorteando) return;
        
        if (this.numerosDisponiveis.length === 0) {
            this.mostrarToast('Todos os 200 números já foram sorteados!', 'warning');
            return;
        }
        
        this.sorteando = true;
        this.btnSortear.disabled = true;
        this.animacaoStep = 0;
        
        // Iniciar animação
        this.animarSorteio();
    }
    
    animarSorteio() {
        if (this.animacaoStep < 30) { // 30 passos de animação
            // Adicionar classe de animação
            this.numeroSorteadoEl.classList.add('animando');
            
            // Gerar número aleatório temporário para animação
            const tempNum = Math.floor(Math.random() * 200) + 1;
            this.numeroSorteadoEl.textContent = tempNum.toString().padStart(3, '0');
            
            // Aumentar velocidade gradualmente
            const velocidade = 30 + (this.animacaoStep * 5);
            
            // Agendar próximo passo
            setTimeout(() => {
                this.animacaoStep++;
                this.animarSorteio();
            }, velocidade);
        } else {
            // Finalizar sorteio
            this.realizarSorteioFinal();
        }
    }
    
    realizarSorteioFinal() {
        // Remover animação
        this.numeroSorteadoEl.classList.remove('animando');
        
        // Usar crypto.getRandomValues para aleatoriedade criptográfica
        const randomArray = new Uint32Array(1);
        window.crypto.getRandomValues(randomArray);
        
        // Gerar índice aleatório seguro
        const randomIndex = randomArray[0] % this.numerosDisponiveis.length;
        const numeroSorteado = this.numerosDisponiveis[randomIndex];
        
        // Atualizar interface
        this.numeroSorteadoEl.textContent = numeroSorteado.toString().padStart(3, '0');
        
        // Atualizar arrays
        this.numerosSorteados.push(numeroSorteado);
        this.numerosDisponiveis = this.numerosDisponiveis.filter(n => n !== numeroSorteado);
        
        // Atualizar interface completa
        this.atualizarListaNumeros();
        this.atualizarEstado();
        
        // Resetar estado
        this.sorteando = false;
        this.btnSortear.disabled = false;
        
        // Mostrar status
        this.statusSorteioEl.textContent = `Número ${numeroSorteado} sorteado com sucesso!`;
        this.mostrarToast(`Número ${numeroSorteado} sorteado!`, 'success');
        
        // Verificar se terminou
        if (this.numerosDisponiveis.length === 0) {
            this.statusSorteioEl.textContent = '🎉 Sorteio Concluído! Todos os 200 números foram sorteados! 🎉';
            this.mostrarToast('Sorteio concluído com sucesso!', 'success');
        }
    }
    
    atualizarListaNumeros() {
        if (this.numerosSorteados.length === 0) {
            this.numerosSorteadosEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Nenhum número sorteado ainda</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.numerosSorteados.forEach((numero, index) => {
            const posicao = index + 1;
            html += `
                <div class="numero-item">
                    <span class="numero-posicao">${posicao}º</span>
                    ${numero}
                </div>
            `;
        });
        
        this.numerosSorteadosEl.innerHTML = html;
        this.totalSorteadosEl.textContent = this.numerosSorteados.length;
    }
    
    atualizarEstado() {
        const sorteados = this.numerosSorteados.length;
        const disponiveis = this.numerosDisponiveis.length;
        const progresso = (sorteados / 200) * 100;
        
        // Atualizar contadores
        this.sorteadosCountEl.textContent = sorteados;
        this.disponiveisCountEl.textContent = disponiveis;
        this.progressoPercentEl.textContent = `${progresso.toFixed(1)}%`;
        
        // Atualizar barra de progresso
        this.progressBarEl.style.width = `${progresso}%`;
        
        // Atualizar badge
        this.totalSorteadosEl.textContent = sorteados;
        
        // Atualizar status se necessário
        if (sorteados === 200) {
            this.btnSortear.disabled = true;
            this.statusSorteioEl.textContent = '🎉 Sorteio Concluído! Todos os 200 números foram sorteados! 🎉';
        }
    }
    
    confirmarReset() {
        if (this.numerosSorteados.length === 0) {
            this.mostrarToast('Nenhum número foi sorteado ainda', 'info');
            return;
        }
        
        this.modalMessage.textContent = 'Tem certeza que deseja reiniciar o sorteio? Todos os números sorteados serão perdidos.';
        this.modal.style.display = 'flex';
    }
    
    realizarReset() {
        // Resetar arrays
        this.numerosSorteados = [];
        this.numerosDisponiveis = [...this.numerosRifa];
        
        // Resetar interface
        this.numeroSorteadoEl.textContent = '--';
        this.numeroSorteadoEl.classList.remove('animando');
        this.statusSorteioEl.textContent = 'Sorteio reiniciado. Pronto para iniciar.';
        
        // Atualizar estado
        this.atualizarListaNumeros();
        this.atualizarEstado();
        
        // Habilitar botão de sortear
        this.btnSortear.disabled = false;
        
        this.mostrarToast('Sorteio reiniciado com sucesso!', 'success');
    }
    
    fecharModal() {
        this.modal.style.display = 'none';
    }
    
    exportarResultados() {
        if (this.numerosSorteados.length === 0) {
            this.mostrarToast('Nenhum número foi sorteado ainda', 'warning');
            return;
        }
        
        const dataAtual = new Date().toLocaleString('pt-BR');
        let conteudo = '='.repeat(50) + '\n';
        conteudo += 'RESULTADO DO SORTEIO DA RIFA - SRE\n';
        conteudo += '='.repeat(50) + '\n\n';
        conteudo += `Data: ${dataAtual}\n`;
        conteudo += `Total de números sorteados: ${this.numerosSorteados.length}/200\n\n`;
        conteudo += 'PRÊMIO: Kit Churrasco (Tábua de carne, Faca e garfo)\n\n';
        conteudo += 'NÚMEROS SORTEADOS (em ordem de sorteio):\n';
        conteudo += '-'.repeat(40) + '\n';
        
        this.numerosSorteados.forEach((numero, index) => {
            conteudo += `${(index + 1).toString().padStart(3, ' ')}. Número ${numero.toString().padStart(3, ' ')}\n`;
        });
        
        conteudo += '\n' + '='.repeat(50) + '\n';
        conteudo += 'SORTEIO CONCLUÍDO COM SUCESSO!\n';
        conteudo += '='.repeat(50) + '\n';
        
        // Criar e baixar arquivo
        const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resultado_sorteio_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarToast('Resultados exportados com sucesso!', 'success');
    }
    
    copiarLista() {
        if (this.numerosSorteados.length === 0) {
            this.mostrarToast('Nenhum número foi sorteado ainda', 'warning');
            return;
        }
        
        const listaTexto = this.numerosSorteados.join(', ');
        
        navigator.clipboard.writeText(listaTexto)
            .then(() => {
                this.mostrarToast('Lista copiada para a área de transferência!', 'success');
            })
            .catch(err => {
                console.error('Erro ao copiar:', err);
                this.mostrarToast('Erro ao copiar para a área de transferência', 'danger');
            });
    }
    
    mostrarToast(mensagem, tipo = 'success') {
        this.toastMessage.textContent = mensagem;
        
        // Resetar classes
        this.toast.className = 'toast';
        
        // Adicionar classe do tipo
        switch(tipo) {
            case 'success':
                this.toast.style.background = '#27AE60';
                break;
            case 'warning':
                this.toast.style.background = '#F39C12';
                break;
            case 'danger':
                this.toast.style.background = '#E74C3C';
                break;
            case 'info':
                this.toast.style.background = '#3498DB';
                break;
        }
        
        // Mostrar toast
        this.toast.classList.add('show');
        
        // Esconder após 3 segundos
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    new SorteioRifa();
});