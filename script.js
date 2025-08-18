var API_URL = 'https://api.github.com/search/repositories';

var inputEl = document.getElementById('search');
var suggestionsEl = document.getElementById('suggestions-list');
var addedListEl = document.getElementById('added-list');

var lastSuggestions = [];
var addedRepos = [];

function debounce(fn, delay) {
  var timer;
  return function () {
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(null, args);
    }, delay);
  };
}

function renderEmptyState() {
  var old = addedListEl.querySelector('.empty');
  if (old) old.remove();

  if (addedRepos.length === 0) {
    var li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Пока ничего не добавлено.';
    addedListEl.appendChild(li);
  }
}

function renderSuggestions(items) {
  suggestionsEl.innerHTML = '';

  if (!items || items.length === 0) {
    suggestionsEl.classList.remove('open');
    return;
  }

  for (var i = 0; i < items.length; i++) {
    var repo = items[i];
    var li = document.createElement('li');
    li.className = 'suggestion-item';
    li.textContent = repo.name;

    li.onclick = (function (r) {
      return function () {
        addRepo(r);
        inputEl.value = '';
        suggestionsEl.innerHTML = '';
        suggestionsEl.classList.remove('open');
      };
    })(repo);

    suggestionsEl.appendChild(li);
  }

  suggestionsEl.classList.add('open');
}

function addRepo(repo) {
  var already = addedRepos.some(function (r) { return r.full_name === repo.full_name; });
  if (already) {
    return;
  }

  addedRepos.push(repo);

  var li = document.createElement('li');
  li.className = 'card';
  li.setAttribute('data-key', repo.full_name);

  var h3 = document.createElement('h3');
  h3.className = 'card-title';
  h3.textContent = 'Name: ' + repo.name;

  var p1 = document.createElement('p');
  p1.className = 'meta';
  p1.textContent = 'Owner: ' + repo.owner.login;

  var p2 = document.createElement('p');
  p2.className = 'meta';
  p2.textContent = 'Stars: ' + repo.stargazers_count;

  var btn = document.createElement('button');
  btn.className = 'remove-btn';
  btn.setAttribute('aria-label', 'Удалить');
  btn.innerHTML = '✕';
  btn.onclick = function () {
    addedRepos = addedRepos.filter(function (r) { return r.full_name !== repo.full_name; });
    li.remove();
    renderEmptyState();
  };

  li.appendChild(h3);
  li.appendChild(btn);
  li.appendChild(p1);
  li.appendChild(p2);
  addedListEl.appendChild(li);

  renderEmptyState();
}

function searchRepos(query) {
  var url = API_URL + '?q=' + encodeURIComponent(query) + '&per_page=5&sort=stars&order=desc';

  return fetch(url)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data || !data.items) return [];
      return data.items;
    })
    .catch(function () {
      return [];
    });
}

var handleInput = debounce(function () {
  var value = inputEl.value.trim();

  if (value === '') {
    suggestionsEl.innerHTML = '';
    suggestionsEl.classList.remove('open');
    return;
  }

  searchRepos(value).then(function (items) {
    lastSuggestions = items;
    renderSuggestions(items);
  });
}, 500);

inputEl.addEventListener('input', handleInput);

renderEmptyState();
