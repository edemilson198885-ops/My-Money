window.MM = window.MM || {};
MM.dashboardScreen = {
  render: function(){
    var m = MM.services.getDashboardMetrics();
    var prevLabel = MM.helpers.formatMonthLabel(MM.helpers.previousMonth(MM.state.currentMonth));

    var incomeList = m.byUserIncome.map(function(item){
      return `<button class="item dashboard-link income-user-link" data-user-id="${item.user.id}" type="button">
        <strong>${item.user.name}</strong>
        <div class="muted">${MM.helpers.formatCurrency(item.total)}</div>
      </button>`;
    }).join('') + `<div class="item compact-total-card"><strong>Total da residência</strong><div class="muted">${MM.helpers.formatCurrency(m.entradas)}</div></div>`;

    var expenseList = m.byUserExpense.map(function(item){
      return `<button class="item dashboard-link expense-user-link" data-user-id="${item.user.id}" type="button">
        <strong>${item.user.name}</strong>
        <div class="muted">${MM.helpers.formatCurrency(item.total)}</div>
      </button>`;
    }).join('') + `<div class="item compact-total-card"><strong>Total da residência</strong><div class="muted">${MM.helpers.formatCurrency(m.saidas)}</div></div>`;

    var balanceList = m.byUserBalance.map(function(item){
      var toneClass = item.total > 0 ? 'positive' : (item.total < 0 ? 'negative' : 'neutral');
      return `<button class="item dashboard-link balance-user-link ${toneClass}" data-user-id="${item.user.id}" type="button">
        <strong>${item.user.name}</strong>
        <div class="muted">Renda: ${MM.helpers.formatCurrency(item.income)} · Gastos: ${MM.helpers.formatCurrency(item.expense)}</div>
        <div class="user-balance-value ${toneClass}">${MM.helpers.formatCurrency(item.total)}</div>
      </button>`;
    }).join('') + `<div class="item total-balance-card"><strong>Total da residência</strong><div class="user-balance-value ${m.saldo >= 0 ? 'positive' : 'negative'}">${MM.helpers.formatCurrency(m.saldo)}</div></div>`;

    var isMobile = window.innerWidth <= 980;
    var chartSeries = Array.isArray(m.monthlyFlow) ? m.monthlyFlow : [];
    var chartSeriesView = isMobile ? chartSeries.slice(-4) : chartSeries;
    var chartMax = chartSeriesView.reduce(function(max,item){
      return Math.max(max, Number(item.entradas || 0), Number(item.saidas || 0));
    }, 0) || 1;
    var chartHtml = chartSeriesView.map(function(item){
      var label = isMobile ? item.label.replace(/\/\d{4}$/, '') : item.label;
      var inPct = Math.max(8, Math.round((Number(item.entradas || 0) / chartMax) * 100));
      var outPct = Math.max(8, Math.round((Number(item.saidas || 0) / chartMax) * 100));
      return `<div class="flow-group">
        <div class="flow-bars">
          <div class="flow-bar entradas" style="height:${inPct}%"><span>${MM.helpers.formatCurrency(item.entradas)}</span></div>
          <div class="flow-bar saidas" style="height:${outPct}%"><span>${MM.helpers.formatCurrency(item.saidas)}</span></div>
        </div>
        <div class="flow-label">${label}</div>
      </div>`;
    }).join('');

    var currentSummary = [
      { label:'Entradas', value: MM.helpers.formatCurrency(m.entradas), tone:'in' },
      { label:'Saídas', value: MM.helpers.formatCurrency(m.saidas), tone:'out' },
      { label:'Saldo do mês', value: MM.helpers.formatCurrency(m.saldo), tone: m.saldo >= 0 ? 'positive' : 'negative' },
      { label:'Saldo anterior', value: MM.helpers.formatCurrency(m.saldoAnterior), tone:'neutral' },
      { label:'A vencer', value: String(m.dueSoon), tone:'neutral' },
      { label:'Atrasadas', value: String(m.overdue), tone: m.overdue > 0 ? 'negative' : 'neutral' }
    ].map(function(card){
      return `<div class="panel metric metric-card metric-card-small tone-${card.tone}">
        <div class="muted">${card.label}</div>
        <div class="metric-mini-value">${card.value}</div>
      </div>`;
    }).join('');

    MM.ui.setHTML('screen-container', `
      <section class="dashboard-shell">
        <div class="panel hero-card hero-card-compact">
          <div class="hero-top">
            <div>
              <div class="hero-label">Visão geral</div>
              <h2 style="margin:6px 0 0 0;font-size:1.15rem">Dashboard</h2>
            </div>
            <div class="actions-inline hero-actions">
              <button class="btn" id="dashboard-new-entry" type="button" style="background:#ffffff1c;color:#fff">Nova entrada</button>
              <button class="btn" id="dashboard-new-entry-extra" type="button" style="background:#ffffff1c;color:#fff">Entrada extra</button>
              <button class="btn" id="dashboard-new-exit" type="button" style="background:#fff;color:#5b21b6">Nova saída</button>
              <button class="btn" id="dashboard-new-extra" type="button" style="background:#ffffff1c;color:#fff">Despesa extra</button>
            </div>
          </div>

          <div class="hero-balance-row">
            <div>
              <div class="hero-label">Saldo do mês</div>
              <div class="hero-value">${MM.helpers.formatCurrency(m.saldo)}</div>
              <div class="hero-sub">Saldo anterior: ${MM.helpers.formatCurrency(m.saldoAnterior)}</div>
            </div>
            <div class="hero-mini-grid hero-mini-grid-compact">
              <div class="hero-mini-card">
                <div class="mini-label">Entradas</div>
                <div class="mini-value">${MM.helpers.formatCurrency(m.entradas)}</div>
              </div>
              <div class="hero-mini-card">
                <div class="mini-label">Saídas</div>
                <div class="mini-value">${MM.helpers.formatCurrency(m.saidas)}</div>
              </div>
              <div class="hero-mini-card">
                <div class="mini-label">Investimentos</div>
                <div class="mini-value">${MM.helpers.formatCurrency(0)}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="metric-grid metric-grid-compact">${currentSummary}</div>

        <div class="summary-grid dashboard-middle-grid">
          <div class="panel section chart-panel">
            <div class="panel-head-inline">
              <div>
                <h3 style="margin:0">Entradas x Saídas</h3>
                <div class="muted">${isMobile ? 'Últimos meses' : 'Últimos meses cadastrados'}</div>
              </div>
              <div class="chart-legend">
                <span><i class="legend-dot entradas"></i>Entradas</span>
                <span><i class="legend-dot saidas"></i>Saídas</span>
              </div>
            </div>
            <div class="flow-chart">${chartHtml || '<div class="muted">Cadastre mais meses para visualizar o gráfico.</div>'}</div>
          </div>

          <div class="panel section compact-summary-panel">
            <h3 style="margin:0 0 12px 0">Resumo rápido</h3>
            <div class="quick-summary-list">
              <div class="quick-summary-item"><span>Saldo anterior</span><strong>${MM.helpers.formatCurrency(m.saldoAnterior)}</strong></div>
              <div class="quick-summary-item"><span>Saldo do mês</span><strong>${MM.helpers.formatCurrency(m.saldo)}</strong></div>
              <div class="quick-summary-item"><span>Entradas</span><strong>${MM.helpers.formatCurrency(m.entradas)}</strong></div>
              <div class="quick-summary-item"><span>Saídas</span><strong>${MM.helpers.formatCurrency(m.saidas)}</strong></div>
            </div>
          </div>
        </div>

        <div class="summary-grid summary-grid-3">
          <div class="panel section">
            <h3 style="margin-top:0">Renda por usuário</h3>
            <div class="item-list">${incomeList}</div>
          </div>
          <div class="panel section">
            <h3 style="margin-top:0">Gastos por usuário</h3>
            <div class="item-list">${expenseList}</div>
          </div>
          <div class="panel section">
            <h3 style="margin-top:0">Saldo por usuário</h3>
            <div class="item-list">${balanceList}</div>
          </div>
        </div>
      </section>
    `);

    document.getElementById('dashboard-new-entry').onclick = function(){ MM.router.goTo(MM.config.SCREENS.ENTRY); };
    document.getElementById('dashboard-new-entry-extra').onclick = function(){ MM.router.goTo(MM.config.SCREENS.ENTRY_EXTRA); };
    document.getElementById('dashboard-new-exit').onclick = function(){ MM.router.goTo(MM.config.SCREENS.EXIT); };
    document.getElementById('dashboard-new-extra').onclick = function(){ MM.router.goTo(MM.config.SCREENS.EXTRA); };

    document.querySelectorAll('.income-user-link').forEach(function(btn){
      btn.onclick = function(e){
        MM.state.movementFilters = { type:'entrada', belongsTo:e.currentTarget.dataset.userId, status:'todos', text:'' };
        MM.router.goTo(MM.config.SCREENS.MOVEMENTS);
      };
    });

    document.querySelectorAll('.expense-user-link').forEach(function(btn){
      btn.onclick = function(e){
        MM.state.movementFilters = { type:'saida', belongsTo:e.currentTarget.dataset.userId, status:'todos', text:'' };
        MM.router.goTo(MM.config.SCREENS.MOVEMENTS);
      };
    });

    document.querySelectorAll('.balance-user-link').forEach(function(btn){
      btn.onclick = function(e){
        MM.state.movementFilters = { type:'todos', belongsTo:e.currentTarget.dataset.userId, status:'todos', text:'' };
        MM.router.goTo(MM.config.SCREENS.MOVEMENTS);
      };
    });
  }
};
