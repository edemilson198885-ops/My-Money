window.MM = window.MM || {};
MM.dashboardScreen = {
  render: function(){
    var m = MM.services.getDashboardMetrics();

    var balanceList = m.byUserBalance.map(function(item){
      var toneClass = item.total > 0 ? 'positive' : (item.total < 0 ? 'negative' : 'neutral');
      return `<button class="item dashboard-link balance-user-link ${toneClass}" data-user-id="${item.user.id}" type="button">
        <div class="user-balance-head">
          <strong>${item.user.name}</strong>
          <span class="user-balance-pill ${toneClass}">${item.total >= 0 ? 'Saldo positivo' : (item.total < 0 ? 'Saldo negativo' : 'Sem saldo')}</span>
        </div>
        <div class="user-balance-value ${toneClass}">${MM.helpers.formatCurrency(item.total)}</div>
        <div class="muted">Renda ${MM.helpers.formatCurrency(item.income)} · Gastos ${MM.helpers.formatCurrency(item.expense)}</div>
      </button>`;
    }).join('') + `<div class="item total-balance-card">
      <strong>Total da residência</strong>
      <div class="user-balance-value ${m.saldo >= 0 ? 'positive' : 'negative'}">${MM.helpers.formatCurrency(m.saldo)}</div>
    </div>`;

    var chartSeries = Array.isArray(m.monthlyFlow) ? m.monthlyFlow.slice(-6) : [];
    var chartMax = chartSeries.reduce(function(max,item){
      return Math.max(max, Number(item.entradas || 0), Number(item.saidas || 0));
    }, 0) || 1;
    var chartHtml = chartSeries.map(function(item){
      var inPct = Math.max(10, Math.round((Number(item.entradas || 0) / chartMax) * 100));
      var outPct = Math.max(10, Math.round((Number(item.saidas || 0) / chartMax) * 100));
      return `<div class="flow-group compact-flow-group">
        <div class="flow-bars compact-flow-bars">
          <div class="flow-bar entradas" style="height:${inPct}%"></div>
          <div class="flow-bar saidas" style="height:${outPct}%"></div>
        </div>
        <div class="flow-values">
          <span>${MM.helpers.formatCurrency(item.entradas)}</span>
          <span>${MM.helpers.formatCurrency(item.saidas)}</span>
        </div>
        <div class="flow-label">${item.label}</div>
      </div>`;
    }).join('');

    var metrics = [
      { label:'Entradas', value: MM.helpers.formatCurrency(m.entradas), tone:'in' },
      { label:'Saídas', value: MM.helpers.formatCurrency(m.saidas), tone:'out' },
      { label:'A vencer', value: String(m.dueSoon), tone:'neutral' },
      { label:'Atrasadas', value: String(m.overdue), tone: m.overdue > 0 ? 'negative' : 'neutral' },
      { label:'Investimentos', value: MM.helpers.formatCurrency(0), tone:'neutral' }
    ].map(function(card){
      return `<div class="panel metric metric-card metric-card-small tone-${card.tone}">
        <div class="muted">${card.label}</div>
        <div class="metric-mini-value">${card.value}</div>
      </div>`;
    }).join('');

    MM.ui.setHTML('screen-container', `
      <section class="dashboard-shell dashboard-shell-clean">
        <div class="panel hero-card hero-card-clean">
          <div class="hero-top hero-top-clean">
            <div>
              <div class="hero-label">Saldo do mês</div>
              <div class="hero-value">${MM.helpers.formatCurrency(m.saldo)}</div>
              <div class="hero-sub">Saldo anterior: ${MM.helpers.formatCurrency(m.saldoAnterior)}</div>
            </div>
            <div class="actions-inline dashboard-quick-actions">
              <button class="btn" id="dashboard-new-entry" type="button" style="background:#ffffff1c;color:#fff">Nova entrada</button>
              <button class="btn" id="dashboard-new-entry-extra" type="button" style="background:#ffffff1c;color:#fff">Entrada extra</button>
              <button class="btn" id="dashboard-new-exit" type="button" style="background:#fff;color:#5b21b6">Nova saída</button>
              <button class="btn" id="dashboard-new-extra" type="button" style="background:#ffffff1c;color:#fff">Despesa extra</button>
            </div>
          </div>
        </div>

        <div class="metric-grid metric-grid-clean">${metrics}</div>

        <div class="summary-grid dashboard-middle-grid dashboard-middle-grid-clean">
          <div class="panel section chart-panel chart-panel-clean">
            <div class="panel-head-inline panel-head-inline-clean">
              <div>
                <h3 style="margin:0">Fluxo do mês</h3>
                <div class="muted">Entradas x saídas dos últimos meses</div>
              </div>
              <div class="chart-legend">
                <span><i class="legend-dot entradas"></i>Entradas</span>
                <span><i class="legend-dot saidas"></i>Saídas</span>
              </div>
            </div>
            <div class="flow-chart flow-chart-clean">${chartHtml || '<div class="muted">Cadastre mais meses para visualizar o gráfico.</div>'}</div>
          </div>

          <div class="panel section single-summary-panel">
            <h3 style="margin:0 0 12px 0">Saldo por usuário</h3>
            <div class="item-list compact-balance-list">${balanceList}</div>
          </div>
        </div>
      </section>
    `);

    document.getElementById('dashboard-new-entry').onclick = function(){ MM.router.goTo(MM.config.SCREENS.ENTRY); };
    document.getElementById('dashboard-new-entry-extra').onclick = function(){ MM.router.goTo(MM.config.SCREENS.ENTRY_EXTRA); };
    document.getElementById('dashboard-new-exit').onclick = function(){ MM.router.goTo(MM.config.SCREENS.EXIT); };
    document.getElementById('dashboard-new-extra').onclick = function(){ MM.router.goTo(MM.config.SCREENS.EXTRA); };

    document.querySelectorAll('.balance-user-link').forEach(function(btn){
      btn.onclick = function(e){
        MM.state.movementFilters = { type:'todos', belongsTo:e.currentTarget.dataset.userId, status:'todos', text:'' };
        MM.router.goTo(MM.config.SCREENS.MOVEMENTS);
      };
    });
  }
};
