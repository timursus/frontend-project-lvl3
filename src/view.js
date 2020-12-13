import { watch } from 'melanke-watchjs';
import { renderNewFeed, renderNewPosts } from './contentRenderers';

const showNotification = (type, message, appNotifications) => {
  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.setAttribute('role', type === 'danger' ? 'alert' : 'status');
  const body = document.createElement('div');
  body.className = `toast-body font-weight-bold text-${type}`;
  body.textContent = message;
  toast.append(body);
  appNotifications.prepend(toast);
  setTimeout(() => toast.remove(), 6000); // auto hide the toast
};

export default (state, elements, changeActiveFeed, t) => {
  const {
    submitBtn,
    formFeedback,
    appNotifications,
    feedsList,
    postsList,
    urlInput,
  } = elements;

  const spinner = document.createElement('span');
  spinner.className = 'spinner-grow spinner-grow-sm';
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-hidden', 'true');

  watch(state.rssForm, ['status', 'valid', 'error'], () => {
    submitBtn.disabled = !state.rssForm.valid;
    switch (state.rssForm.status) {
      case 'filling': {
        if (state.rssForm.valid) {
          formFeedback.textContent = '';
          urlInput.classList.remove('is-invalid');
        } else {
          formFeedback.textContent = t(state.rssForm.error);
          urlInput.classList.add('is-invalid');
        }
        break;
      }
      case 'loading': {
        submitBtn.disabled = true;
        submitBtn.textContent = t('addButton.loading');
        submitBtn.prepend(spinner);
        break;
      }
      case 'added': {
        submitBtn.innerText = t('addButton.default');
        showNotification('success', t('loading.success'), appNotifications);
        elements.rssForm.reset();
        break;
      }
      case 'failed': {
        submitBtn.innerText = t('addButton.default');
        showNotification('danger', t(state.appError), appNotifications);
        break;
      }
      default:
        throw new Error(`Unknown rssForm state: ${state.rssForm.status}`);
    }
  });

  const feedsWatchLevel = 1;
  watch(state.content, 'feeds', renderNewFeed(state, feedsList, changeActiveFeed), feedsWatchLevel);

  watch(state.content, 'posts', renderNewPosts(state, postsList));

  watch(state.rssList.feedSelection, 'enabled', () => {
    if (state.rssList.feedSelection.enabled) {
      elements.showAllBtn.classList.remove('d-none');
      feedsList.querySelector('a.disabled').classList.remove('disabled');
    }
  });

  watch(state.rssList.feedSelection, 'activeId', () => {
    const { activeId } = state.rssList.feedSelection;
    feedsList.querySelector('a.active').classList.remove('active');
    feedsList.querySelector(`a[href="#${activeId}"]`).classList.add('active');
    postsList.querySelectorAll('a.post').forEach((post) => {
      if (activeId === 'all' || post.dataset.feedId === activeId) {
        post.classList.remove('d-none');
      } else {
        post.classList.add('d-none');
      }
    });
  });
};
