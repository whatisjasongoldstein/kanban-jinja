/**
 * csrf token setup for ajax request.
 * @see https://docs.djangoproject.com/en/1.10/ref/csrf/#ajax
 */
(function(window, $){
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');    

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

})(window, jQuery);



(function(window, document, $){

    /**
     * Given an element and the html
     * it should become, apply morphdom
     * to make the incremental DOM changes.
     */
    function lazyRender(el, html, callback) {
        let cloneEl = el.cloneNode();
        cloneEl.innerHTML = html;
        window.requestAnimationFrame(function(){
            morphdom(el, cloneEl);
            if (callback) {
                callback();
            }
        });
    };

    function uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    window.app = {
        init: function() {
            var dataContainer = document.getElementById("board-data");
            if (!dataContainer) {
                return;
            }
            this.data = JSON.parse(dataContainer.innerText);
            this.$app = $(".a-kanban-board");
            this.bindEvents();
        },

        bindEvents: function() {
            var self = this;

            this.$app.on("submit", ".js-new-task", function(e){
                e.preventDefault();
                var fields = this.querySelectorAll('[name]');
                var data = {};

                var f;
                for (var i = 0; i < fields.length; i++) {
                    f = fields[i];
                    data[f.name] = f.value;
                }

                self.createTask(data);
                self.render();
            });

            this.$app.on("click tap", ".js-delete", function(e){
                var task = self.getTaskById(this.dataset.id);
                self.deleteTask(task);
            });

            this.bindSortable();

            this.$app.find(".js-sortable").on("sortstop", function(e){
                self.updatePositions();
            });
        },

        getStateById: function(id) {
            let states = this.data["states"].filter(function(s){
                return s.id === id;
            });
            return states[0];
        },

        bindSortable: function() {
            sortable('.js-sortable', 'destroy');
            
            sortable('.js-sortable', {
              placeholderClass: 'c-task-placeholder',
              connectWith: ".js-sortable",
            });
        },

        getAllTasks: function() {
            let tasks = [];
            for (var i = 0; i < this.data.states.length; i++) {
                tasks = tasks.concat(this.data.states[i].tasks);
            }
            return tasks;
        },

        getTaskElement: function(task) {
            return $(`.js-card[data-id="${task.id}"]`);
        },

        updatePositions: function() {
            let tasks = this.getAllTasks();

            // Modify the tasks and filter the ones that changed
            let tasksChanged = tasks.filter(function(task){
                let $el = this.getTaskElement(task);
                let state = $el.closest(".js-state").attr("data-id");
                let position = $el.index();
                let changed = (task.state !== state || task.position !== position);
                task.position = position;
                task.state = state;
                return changed;
            }.bind(this));

            tasksChanged.map( (task) => this.saveTask(task));
        },

        getTaskById: function(id) {
            let tasks = this.data["states"].map(function(s){
                let matches = s.tasks.filter(function(t){
                    return t.id === id;
                });
                if (matches.length) {
                    return matches[0];
                }
                return null;
            }).filter(function(i){
                return i !== null;
            });
            return tasks[0];
        },

        createTask: function(data) {
            var pos;
            var state = this.data.states[0];

            var card = Object.assign({
                id: null,
                name: null,
                state: state.id,
                position: state.tasks.length,
                description: "",
            }, data);

            this.saveTask(card);
            state.tasks.push(card);
            this.render();
        },

        saveTask: function(data) {
            var self = this;

            let path = data.id ? `/api/tasks/${ data.id }/` : `/api/tasks/`;
            let method = data.id ? "patch" : "post";
            // let req = $.post(path, data);
            let req = $.ajax(path, {
                method: method,
                data: data,
                cache: false,
                dataType: "json",
            });

            req.then(function(resp){
                if (!data.id) {
                    data.id = resp.id;
                }
                self.render();
            }).fail(function(){
                console.error("Could not save.");
            });
        },

        deleteTask: function(task) {
            let self = this;

            var req = $.ajax({
                url: `/api/tasks/${ task.id }/`,
                method: "DELETE",
            }).then(function(resp){
                let state = self.getStateById(task.state);
                state.tasks.pop(state.tasks.indexOf(task));
                self.render();
            }).fail(function(){
                console.error("Could not delete");
            });
        },

        cleanData: function() {
            // Move mismatched tasks
            // TODO: this part doesn't work.
            var self = this;
            this.data.states.forEach(function(state){
                let mismatched = state.tasks.filter((task) => task.state !== state.id);
                mismatched.forEach(function(task){
                    state.tasks.pop(task);
                    let newState = self.getStateById(task.state);
                    newState.tasks.push(state);
                });
            });
            
            // Sort tasks
            for (var i = 0; i < this.data.states.length; i++) {
                let state = this.data.states[i];
                state.tasks = state.tasks.sort((a, b) => a.position - b.position);
            }
        },

        /**
         * Render the component using the nunjuck's
         * template and a context build from the current state.
         */
        render: function() {
            let self = this;

            this.cleanData();

            let html = nunjucks.render("components/board.html", {
                board: this.data,
            });

            lazyRender(this.$app[0], html, function(){
                self.bindSortable();
            });
        },
    }

    app.init();

})(window, document, jQuery);