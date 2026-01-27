// The Kitchen - Project Board
// Bob & Bitty's shared workspace

class Kitchen {
  constructor() {
    this.data = null;
    this.init();
  }

  async init() {
    await this.loadData();
    this.render();
  }

  async loadData() {
    try {
      const response = await fetch('data/board.json');
      this.data = await response.json();
    } catch (error) {
      console.error('Failed to load board data:', error);
      this.data = {
        meta: { lastUpdated: null, lastActivity: null },
        raw: [],
        cooking: [],
        served: [],
        ideas: []
      };
    }
  }

  render() {
    this.renderColumn('raw');
    this.renderColumn('cooking');
    this.renderColumn('served');
    this.renderColumn('ideas');
    this.updateActivity();
  }

  renderColumn(column) {
    const container = document.getElementById(`${column}-cards`);
    const countEl = document.getElementById(`${column}-count`);
    const items = this.data[column] || [];

    countEl.textContent = items.length;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">${this.getEmptyIcon(column)}</span>
          <p>${this.getEmptyText(column)}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => this.renderCard(item)).join('');
  }

  renderCard(item) {
    const priority = item.priority ? this.renderPriority(item.priority) : '';
    const tags = item.tags?.map(t => `<span class="card-tag">${t}</span>`).join('') || '';
    const time = item.updated ? this.formatTime(item.updated) : '';
    const link = item.url ? `<a href="${item.url}" target="_blank" class="card-link">View →</a>` : '';
    const desc = item.description ? `<p class="card-desc">${this.escapeHtml(item.description)}</p>` : '';

    return `
      <article class="card">
        <div class="card-header">
          <span class="card-icon">${item.icon || '📋'}</span>
          <h3 class="card-title">${this.escapeHtml(item.title)}</h3>
          ${priority}
        </div>
        ${desc}
        <div class="card-meta">
          ${tags}
          ${time ? `<span class="card-time">${time}</span>` : ''}
        </div>
        ${link}
      </article>
    `;
  }

  renderPriority(level) {
    const flames = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
    return `<div class="card-priority">${'<span class="flame">🔥</span>'.repeat(flames)}</div>`;
  }

  updateActivity() {
    const activityText = document.getElementById('activity-text');
    if (this.data.meta?.lastActivity) {
      activityText.textContent = this.data.meta.lastActivity;
    } else if (this.data.meta?.lastUpdated) {
      activityText.textContent = `Last updated: ${this.formatTime(this.data.meta.lastUpdated)}`;
    } else {
      activityText.textContent = 'Ready to cook';
    }
  }

  formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getEmptyIcon(column) {
    const icons = { raw: '🥩', cooking: '🍳', served: '🍽️', ideas: '💡' };
    return icons[column] || '📋';
  }

  getEmptyText(column) {
    const texts = {
      raw: 'Nothing in the queue',
      cooking: 'Nothing cooking right now',
      served: 'Nothing served yet',
      ideas: 'No recipe ideas yet'
    };
    return texts[column] || 'Empty';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.kitchen = new Kitchen();
});
