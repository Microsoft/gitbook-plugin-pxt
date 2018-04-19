
require(["gitbook", "jQuery"], function (gitbook, $) {

    var injectRenderer = function (makecodeUrl) {
        var f = $("<iframe>", {
            id: "makecoderenderer",
            src: `https://${makecodeUrl}/--docs?render=1&lang=${$('html').attr('lang')}`
        });
        f.css("position", "absolute");
        f.css("left", 0);
        f.css("bottom", 0);
        f.css("width", "1px");
        f.css("height", "1px");
        $('body').append(f);
    }

    function makeCodeRenderPre(pre) {
        var f = document.getElementById("makecoderenderer");
        f.contentWindow.postMessage({
            type: "renderblocks",
            id: pre.id,
            code: pre.innerText
        }, "*");
    }

    var attachBlocksListener = function () {
        var blockId = 0;
        window.addEventListener("message", function (ev) {
            var msg = ev.data;
            if (msg.source != "makecode") return;

            switch (msg.type) {
                case "renderready":
                    $(`.lang-blocks`).each(function () {
                        var codeDiv = $(this)[0];
                        codeDiv.id = `pxt-blocks-${blockId++}`;
                        makeCodeRenderPre(codeDiv);
                    });
                    break;
                case "renderblocks":
                    var id = msg.id; // this is the id you sent
                    if (msg.svg) {
                        var svg = msg.svg; // this is an string containing SVG
                        // replace text with svg
                        var img = document.createElement("img");
                        img.src = msg.uri;
                        img.width = msg.width;
                        img.height = msg.height;
                        var code = document.getElementById(id)
                        code.parentElement.insertBefore(img, code)
                        code.parentElement.removeChild(code);
                    } else {
                        // Unable to render the SVG. Output an error message
                        var code = document.getElementById(id)
                        var span = document.createElement('span');
                        span.style.color = 'red';
                        span.textContent = "An error occured, check the console for details";
                        code.appendChild(span);
                    }
                    break;
            }
        }, false);
    }

    $(function () {
        var makecodeUrl = gitbook.state.config && gitbook.state.config.pluginsConfig &&
            gitbook.state.config.pluginsConfig.pxt && gitbook.state.config.pluginsConfig.pxt.baseUrl ||
            'makecode.microbit.org';

        injectRenderer(makecodeUrl);
        attachBlocksListener();
    });
});
