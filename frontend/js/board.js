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
    function lazyRender(el, html) {
        let cloneEl = el.cloneNode();
        cloneEl.innerHTML = html;
        window.requestAnimationFrame(function(){
            morphdom(el, cloneEl);
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
        },

        createTask: function(data) {
            var pos;
            var state = this.data.states[0];

            var card = Object.assign({
                id: null,
                name: null,
                state: state.id,
                position: state.tasks.length,
                description: null,
            }, data);

            this.saveTask(card);
            state.tasks.push(card);
            this.render();
        },

        saveTask: function(data) {
            var self = this;
            var req = $.post("/endpoint/", data);
            req.then(function(){
                debugger;
            }).fail(function(){
                console.error("Could not save.");
            });
        },

        /**
         * Render the component using the nunjuck's
         * template and a context build from the current state.
         */
        render: function() {
            var html = nunjucks.render("components/board.html", {
                board: this.data
            });
            lazyRender(this.$app[0], html);
        },
    }

    app.init();

})(window, document, jQuery);