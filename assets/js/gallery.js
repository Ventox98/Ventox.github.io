let gallery_modal;

function setup_modal() {
    const modal = `
    <div class="gallery-container">
        <button class="gallery-close" onclick="close_gallery()"><img src="/images/icons/bx-x.svg"alt="Close"></button>
        <div class="gallery-overlay">
            <div class="gallery-loading">
                <img src="gallery/throbber.svg">
            </div>
            <img class="gallery_img" src="">
        </div>
        <div class="gallery-controls">
            <button class="gallery-prev" onclick="prev()"><img src="/gallery/prev.svg"alt="Prev"></button>
            <div class="gallery_others"></div>
            <button class="gallery-next" onclick="next()"><img src="/gallery/next.svg"alt="Next"></button>
        </div>
        </div>
    `;

    let div = this.document.createElement("div");
    div.id = "gallery_modal";
    div.innerHTML = modal;
    document.body.appendChild(div);
    gallery_modal = div;
}

var galleries = {};
var current_info = {
    "gallery": -1,
    "index": -1
}

/**
 * 
 * @param {Element} container 
 */
function setup_gallery(id, container) {
    for(let i in container.children) {
        let child = container.children[i];
        if(child instanceof Image) {
            child.dataset["galleryId"] = id;
            galleries[id].push(child);
            child.onclick = function() {show_gallery(id, i)};
            child.style.cursor = "pointer";
            child.classList.add("gallery-thumbnail")
            child.onmousemove = function(event) {
                var localPos = {
                    "left": event.x - event.target.x,
                    "top": event.y - event.target.y,
                    "percentage": {
                        "left": (event.x - event.target.x) / event.target.width,
                        "top": (event.y - event.target.y) / event.target.height,
                    }
                }

                child.style.transform = "rotate3d(" + (1 - localPos.percentage.top - 0.5) + ", " + (localPos.percentage.left - 0.5) + ", 0, 10deg)";
            }

            child.onmouseleave = function(event) {
                child.style.transform = "";
            }
        }
    }
}


function close_gallery() {
    gallery_modal.classList.remove("open");
}


function show_gallery(gallery_id, img_id) {
    let image = galleries[gallery_id][img_id];
    console.log("Open gallery image", img_id, "from gallery", gallery_id);
    gallery_modal.classList.add("open");
    gallery_modal.classList.add("animated");

    let displayer = gallery_modal.getElementsByClassName("gallery_img")[0];
    displayer.src = image.dataset["highSrc"] ? image.dataset["highSrc"] : image.src;
    if(!displayer.complete) {
        gallery_modal.classList.add("loading");
        displayer.onload = function (e) {
            console.log("loaded!");
            gallery_modal.classList.remove("loading");
            gallery_modal.getElementsByClassName("gallery-controls")[0].style.width = displayer.width + "px";
        };
    } else {
        gallery_modal.getElementsByClassName("gallery-controls")[0].style.width = displayer.width + "px";
    }
    displayer.style["aspect-ratio"] = (image.width / image.height);
    gallery_modal.onclick = function(event) {if(event.target == gallery_modal) close_gallery()};

    current_info.gallery = gallery_id;
    current_info.index = img_id;

    // Add Thumbnails
    let container = gallery_modal.getElementsByClassName("gallery_others")[0];
    container.innerHTML = "";

    for(let i in galleries[gallery_id]) {
        let img = galleries[gallery_id][i]
        let thumb = document.createElement("img");
        thumb.onclick = function() { show_gallery(gallery_id, i)}
        thumb.src = img.src;
        container.appendChild(thumb);
    }

    let current_thumb = container.children[img_id];
    current_thumb.classList.add("selected");
    current_thumb.scrollIntoView();
}


function prev() {
    show_gallery(current_info.gallery, (galleries[current_info.gallery].length + (current_info.index - 1)) % galleries[current_info.gallery].length);
}


function next() {
    show_gallery(current_info.gallery, ((current_info.index - 0) + 1) % galleries[current_info.gallery].length);
}


window.addEventListener("keydown", function(e) {
    if(!gallery_modal.classList.contains("open")) return;
    switch(e.key) {
        case "Escape":
            e.stopPropagation();
            close_gallery();
            gallery_modal.classList.remove("animated");
            break;
        case "ArrowLeft":
            e.stopPropagation();
            prev();
            break;
        case "ArrowRight":
            e.stopPropagation();
            next();
            break;
    }
});


window.addEventListener("load", function() {
    let id = 1000;
    for(let gallery of this.document.getElementsByClassName("gallery")) {
        galleries[id] = [];
        setup_gallery(id, gallery);
        id++;
    }

    setup_modal();
});