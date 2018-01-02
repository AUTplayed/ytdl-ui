$(document).ready(() => {
    connect();
    binding();
});

var hidden = true;

function binding() {
    $("#btn_check").click(() => {
        var url = $("#url").val();
        $.post("check", { url: url });
    });
    $("#btn_dl").click(() => {
        var checkitems = $(".download:checked").parent().parent();
        var downloads = [];
        for (var i = 0; i < checkitems.length; i++) {
            downloads.push(checkitems.eq(i).attr("id"));
        }
        $.post("download", { videos: downloads });
    });
    $("#btn_hide").click(() => {
        hide(!hidden);
    });
}

var existingItems = [];

function hide(hidetf) {
    hidden = hidetf;
    var checkitems = $(".download").not(":checked").parent().parent();
    if (hidetf) {
        checkitems.hide();
    } else {
        checkitems.show();
    }
}

function connect() {
    var ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (ev) => {
        var msg = JSON.parse(ev.data);
        console.log(msg);
        if (msg.alert) {
            Materialize.toast(msg.alert, 5000)
            if (msg.alert == "Finished Checking") {
                hide(true);
            }
        } else {
            if (existingItems.indexOf(msg.id) > -1) {
                updateItem(msg);
            } else {
                existingItems.push(msg.id);
                $("#list").append(buildItem(msg));
            }
        }
    }
}

function buildItem(item) {
    return `
    <li class="collection-item avatar" id="${item.id}">
        <img src="${item.thumbnail}" alt="no thumbnail" class="circle">
        <span class="title">${item.title}</span>
        <p class="status">${item.status}</p>
        <div class="progress">
            <div class="${item.progresstype} progressbar" style="width: ${item.progress * 100}%"></div>
        </div>
        <p>
            <input class="secondary-content download" type="checkbox" ${item.checked} id="download${item.id}" />
            <label for="download${item.id}">Download</label>
        </p>
    </li>
    `
}

function updateItem(item) {
    var element = $(`#${item.id}`);
    if (element.length > 0) {
        if (item.status){
            element.find(".status").html(item.status);
            if(item.status === "Done"){
                element.find(".download").removeAttr("checked");
            }
        }
        if (item.progress) element.find(".progressbar").css("width", (item.progress * 100) + "%");
        if (item.progresstype) {
            element.find(".progressbar").attr("class", "progressbar").addClass(item.progresstype);
        }
    }
}