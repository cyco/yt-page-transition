var transitionManager;

window.addEventListener(
    "load",
    () => {
        var footer = document.body.lastElementChild;

        transitionManager = new TransitionManager({
            displayPage(dom) {
                var previousMain = document.querySelector("main");
                var newMain = dom.querySelector("main");

                previousMain.parentElement.replaceChild(newMain, previousMain);
            },

            displayError(e) {
                footer.classList.add("error");
                footer.textContent =
                    e.code +
                    " (" +
                    e.statusText +
                    "): " +
                    (e.response || "<no response>");
            },

            startTransition() {
                footer.classList.remove("error");
                footer.textContent = "";

                var progressBar = document.createElement("div");
                progressBar.classList.add("progress-bar");
                var progressIndicator = document.createElement("div");
                progressIndicator.style.width = "0%";
                progressBar.appendChild(progressIndicator);
                footer.appendChild(progressBar);

                // jump start progress since we don't get useful events in demo
                // HACK: get webkit to actually animate the width change
                setTimeout(() => (progressIndicator.style.width = "90%"));
            },
            progressTransition(e) {
                var progressIndicator = footer.querySelector(
                    ".progress-bar div"
                );
                progressIndicator.style.transition = "width 0.2s ease-in";
                progressIndicator.style.width =
                    (0.8 + e.progress * 0.2) * 100 + "%";
            },
            stopTransition() {
                var progress = footer.querySelector(".progress-bar");
                progress.style.opacity = 0;
            }
        });

        window.addEventListener("click", e => {
            const node = e.target;
            const anchor = node.closest("a");
            if (!anchor) {
                return;
            }

            if (anchor.target !== "") return;

            if (!transitionManager.urlIsSuitableForTransition(anchor.href)) {
                return;
            }

            var hash = new URL(anchor.href).hash;
            if (hash !== "") {
                return;
            }

            transitionManager.transitionTo(anchor.href);

            e.preventDefault();
            e.stopPropagation();
        });
    },
    { once: true }
);
