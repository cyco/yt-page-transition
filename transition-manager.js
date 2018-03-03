"use strict";

function TransitionManager(callbacks) {
    callbacks = callbacks || {};

    this._request = null;

    this._onTransitionStart = callbacks.startTransition || null;
    this._onTransitionProgress = callbacks.progressTransition || null;
    this._onTransitionEnd = callbacks.stopTransition || null;

    this._onPage = callbacks.displayPage || null;
    this._onError = callbacks.displayError || null;

    window.onpopstate = (e) => this.performTransition(e.state);
}

TransitionManager.prototype.urlIsSuitableForTransition = function(candidate) {
    var target = new URL(candidate);
    var source = window.location;

    return target.origin === source.origin;
};

TransitionManager.prototype.endTransition = function() {
    this._request = null;
    if (this._onTransitionEnd instanceof Function) {
        this._onTransitionEnd({});
    }
};

TransitionManager.prototype.cancelTransition = function() {
    if (!this.isTransitioning()) return;
    console.assert(this._request !== null);
    this._request.abort();
    this._request = null;

    if (this._onTransitionEnd instanceof Function) {
        this._onTransitionEnd({});
    }
};

TransitionManager.prototype.isTransitioning = function() {
    return this._request !== null;
};

TransitionManager.prototype.transitionTo = function(target) {
    var state = { target: target };
    history.pushState(state, "", target);
    this.performTransition(state);
};

TransitionManager.prototype.performTransition = function(state) {
    var target = state.target;

    if (this.isTransitioning()) this.cancelTransition();

    if (this._onTransitionStart instanceof Function) {
        this._onTransitionStart({});
    }

    this._request = new XMLHttpRequest();
    this._request.open("GET", target, true);
    this._request.onerror = e => {
        this.handleError(
            this._request.status,
            this._request.response,
            this._request.statusText
        );
    };
    this._request.upload.onprogress = e => {
        var progress = e.lengthComputable ? e.loaded / e.total : 1;

        if (this._onTransitionProgress instanceof Function) {
            this._onTransitionProgress({
                progress: Math.min(0.5, progress / 2)
            });
        }
    };

    this._request.onprogress = e => {
        var progress = e.lengthComputable ? e.loaded / e.total : 1;

        if (this._onTransitionProgress instanceof Function) {
            this._onTransitionProgress({
                progress: 0.5 + Math.min(0.5, progress / 2)
            });
        }
    };

    this._request.onload = e => {
        var request = this._request;
        this.endTransition();

        var status = request.status;
        if (status < 200 || 300 <= status) {
            this.handleError(
                request.status,
                request.response,
                request.statusText
            );
            return;
        }

        var dom = document.createElement("template");
        dom.innerHTML = request.response;
        this.handlePage(dom.content);
    };
    this._request.send();
};

TransitionManager.prototype.handlePage = function(response) {
    if (this._onPage instanceof Function) {
        this._onPage(response);
    }
};

TransitionManager.prototype.handleError = function(code, response, statusText) {
    if (this._onError instanceof Function) {
        this._onError({
            code: code,
            response: response,
            statusText: statusText
        });
    }
};

window.TransitionManager = TransitionManager;
