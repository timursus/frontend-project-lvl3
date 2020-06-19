import { string } from 'yup';
import i18next from 'i18next';
import resources from './locales';
import { loadNewChannel, refresh } from './contentLoad';
import render from './view';

const validateUrl = (url, addedURLs) => {
  const schema = string()
    .url('validationErrors.notValidURL')
    .notOneOf(addedURLs, 'validationErrors.alreadyAdded');
  return schema.validate(url);
};

const updateValidationState = (state) => {
  const addedURLs = state.content.feeds.map(({ url }) => url);
  validateUrl(state.rssForm.value, addedURLs)
    .then(() => {
      state.rssForm.valid = true;
      state.rssForm.error = '';
    })
    .catch((err) => {
      state.rssForm.valid = false;
      const [errorKey] = err.errors;
      state.rssForm.error = errorKey;
    });
};

export default () => {
  const elements = {
    rssForm: document.querySelector('.rss-form'),
    urlInput: document.querySelector('input[name="url"]'),
    submitBtn: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feedsList: document.querySelector('.rss-items'),
    postsList: document.querySelector('.rss-links'),
  };

  const state = {
    content: {
      feeds: [],
      posts: [],
    },
    rssForm: {
      state: 'validation', // loading, added, failed
      value: '',
      valid: true,
      error: '',
    },
  };

  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then((t) => render(state, elements, t));

  elements.urlInput.addEventListener('input', (e) => {
    state.rssForm.state = 'validation';
    state.rssForm.value = e.target.value;
    updateValidationState(state);
  });

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.rssForm.state = 'loading';
    const url = state.rssForm.value;
    loadNewChannel(url, state).then(() => {
      state.rssForm.state = 'added';
    });
  });

  refresh(state.content);
};
