CTFd._internal.challenge.data = undefined

CTFd._internal.challenge.renderer = CTFd.lib.markdown();

CTFd._internal.challenge.preRender = function() {}

CTFd._internal.challenge.render = function(markdown) {
    return CTFd._internal.challenge.renderer.render(markdown)
}

CTFd._internal.challenge.postRender = function() { loadInfo(); }

if ($ === undefined) $ = CTFd.lib.$;

function loadInfo() {
    var challenge_id = parseInt($('#challenge-id').val());
    var url = "/api/v1/container?challenge_id=" + challenge_id;

    var params = {};

    CTFd.fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function(response) {
        var info_tpl =
            '<div class="card" style="width: 100%;">' +
            '<div class="card-body">' +
            '<h5 class="card-title">题目实例</h5>' +
            '%content' +
            '</div></div>';
        if (response.remaining_time === undefined) {
            $('#whale-panel').html(info_tpl.replace('%content',
                '<button type="button" class="btn btn-primary card-link" id="whale-button-boot" onclick="CTFd._internal.challenge.boot()">部署题目环境</button>'
            ));
        } else {
            var activated_tpl = info_tpl.replace('%content',
                '<h6 class="card-subtitle mb-2 text-muted" id="whale-challenge-count-down">剩余时间: ' + response.remaining_time + 's</h6>' +
                '<h6 class="card-subtitle mb-2 text-muted">Lan Domain: ' + response.lan_domain + '</h6>' +
                "%chall_link" +
                '<button type="button" class="btn btn-danger card-link" id="whale-button-destroy" onclick="CTFd._internal.challenge.destroy()">销毁环境</button>' +
                '<button type="button" class="btn btn-success card-link" id="whale-button-renew" onclick="CTFd._internal.challenge.renew()">延长时限</button>'
            );
            if (response.type === 'http') {
                $('#whale-panel').html(activated_tpl.replace("%chall_link",
                    '<p class="card-text">http://' + response.domain + '</p>'
                ));
            } else {
                $('#whale-panel').html(activated_tpl.replace("%chall_link",
                    '<p class="card-text">' + response.ip + ':' + response.port + '</p>'
                ));
            }

            if (window.t !== undefined) {
                clearInterval(window.t);
                window.t = undefined;
            }

            function showAuto() {
                const c = $('#whale-challenge-count-down')[0];
                if (c === undefined) return;
                const origin = c.innerHTML;
                const second = parseInt(origin.split(": ")[1].split('s')[0]) - 1;
                c.innerHTML = '剩余时间: ' + second + 's';
                if (second < 0) {
                    loadInfo();
                }
            }

            window.t = setInterval(showAuto, 1000);
        }
    });
};

CTFd._internal.challenge.destroy = function() {
    var challenge_id = parseInt($('#challenge-id').val());
    var url = "/api/v1/container?challenge_id=" + challenge_id;

    $('#whale-button-destroy')[0].innerHTML = "Waiting...";
    $('#whale-button-destroy')[0].disabled = true;

    var params = {};

    CTFd.fetch(url, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function(response) {
        if (response.success) {
            loadInfo();
            CTFd.ui.ezq.ezAlert({
                title: "成功",
                body: "已销毁题目环境",
                button: "OK"
            });
        } else {
            $('#whale-button-destroy')[0].innerHTML = "销毁环境";
            $('#whale-button-destroy')[0].disabled = false;
            CTFd.ui.ezq.ezAlert({
                title: "失败",
                body: response.msg,
                button: "OK"
            });
        }
    });
};

CTFd._internal.challenge.renew = function() {
    var challenge_id = parseInt($('#challenge-id').val());
    var url = "/api/v1/container?challenge_id=" + challenge_id;

    $('#whale-button-renew')[0].innerHTML = "Waiting...";
    $('#whale-button-renew')[0].disabled = true;

    var params = {};

    CTFd.fetch(url, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function(response) {
        if (response.success) {
            loadInfo();
            CTFd.ui.ezq.ezAlert({
                title: "成功",
                body: "时限已延长",
                button: "OK"
            });
        } else {
            $('#whale-button-renew')[0].innerHTML = "延长时限";
            $('#whale-button-renew')[0].disabled = false;
            CTFd.ui.ezq.ezAlert({
                title: "失败",
                body: response.msg,
                button: "OK"
            });
        }
    });
};

CTFd._internal.challenge.boot = function() {
    var challenge_id = parseInt($('#challenge-id').val());
    var url = "/api/v1/container?challenge_id=" + challenge_id;

    $('#whale-button-boot')[0].innerHTML = "Waiting...";
    $('#whale-button-boot')[0].disabled = true;

    var params = {};

    CTFd.fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function(response) {
        if (response.success) {
            loadInfo();
            CTFd.ui.ezq.ezAlert({
                title: "成功",
                body: "题目环境已部署",
                button: "OK"
            });
        } else {
            $('#whale-button-boot')[0].innerHTML = "部署题目环境";
            $('#whale-button-boot')[0].disabled = false;
            CTFd.ui.ezq.ezAlert({
                title: "失败",
                body: response.msg,
                button: "OK"
            });
        }
    });
};


CTFd._internal.challenge.submit = function(preview) {
    var challenge_id = parseInt($('#challenge-id').val())
    var submission = $('#submission-input').val()

    var body = {
        'challenge_id': challenge_id,
        'submission': submission,
    }
    var params = {}
    if (preview)
        params['preview'] = true

    return CTFd.api.post_challenge_attempt(params, body).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response
        }
        return response
    })
};