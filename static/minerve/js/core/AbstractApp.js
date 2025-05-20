export class AbstractApp {
        settings = {}
        urls = {
            "_api_prefix":"/api/v1",
            "_prefix":"/"
        }
        elements = {}
    _parent_walker(parent,target_node) {
       if (target_node == undefined) { target_node = "DIV"};
       while (parent.nodeName != target_node) {
            parent = parent.parentElement;
        };
        return $(parent);

    }
    _parse_ajax_error(data) {
        var errStr="";
        var errors = data.e;
        for (var eks in errors) {
            if (typeof(errors[eks][0]) != "string") {
                errStr = errStr + " <em>" + eks + "</em>: " + errors[eks][0]["message"] + "<br/>";
            } else {
                errStr = errStr + " <em>" + eks + "</em>: " + errors[eks][0] + "<br/>";
            }
            $(this.elements["form"]).find("#id_"+eks).addClass('is-invalid');
        }
        return errStr;
    }
    _confirm_and_get_ajax_url_handle(callback,data) {
        this.hideLoading();
        if (data.res == "ok") {
            this.successToast("Complete!","Operation Complete!");

            if (callback != false) {
                callback();
            }
        } else {
            this.errorToast("Error!",data.error)
        }
    }
    confirm_and_get_ajax_url(surl,callback,confirm_msg) {
        if  (confirm(confirm_msg)) {
            this.showLoading();
            let url = this.urls["_api_prefix"]+surl;
            $.ajax({
                url:   url,
                method: 'GET',
                context: this
            }).done(this._confirm_and_get_ajax_url_handle.bind(this,callback))
        }
    }

    confirm_and_post_ajax_url(surl,post_form,confirm_msg,callback) {
        if  (confirm(confirm_msg)) {
            this.showLoading();
            let url = this.urls["_api_prefix"]+surl;
            $.ajax({
                url:  url,
                data:     new FormData(post_form[0]),
                method: 'POST',
                context: this,
                cache: false,
                contentType: false,
                processData: false
                }).done(this._confirm_and_get_ajax_url_handle.bind(this, callback))
        }
    }
    generic_post_form_handle(modal,callback,res) {
        if (res.res == "ok") {
            if (!("silent" in res)) {
                if (res.msg !== false) {
                    console.log(res.msg);
                } else {
                    console.log("Operation Complete!");
                }
            }
            if (callback !== false) {
                callback(res);
            }
        }  else {
           console.error('Error!',res.error);
        }
    }
    generic_post_form(event,modal=false,callback=false) {
        event.preventDefault();
        event.stopPropagation();
        let form = $(event.target);
        let url = form.data("post-url");
        if (form.data("post-prefix") !== false) {
            url = this.urls["_api_prefix"] + url;
        }
        this.elements["form"] = $(form);
        try {
            this.elements["modal"] = $(this.settings["modal_id"]);
        } catch (e) {}
        $.ajax({
            url:  url,
            method: 'POST',
            context: this,
            cache: false,
            contentType: false,
            processData: false,
            dataType: 'json',
            data: new FormData(this.elements["form"][0])
            }).done(this.generic_post_form_handle.bind(this,modal,callback));

    }

    _generic_apiget_handle(callback,data) {
        this.hideLoading();
        if (data.res == "ok") {
            if (!("silent" in data))
            {
                this.successToast("Complete!", "Operation Complete!");
            }
            if (callback !== false) {
                callback();
            }
        } else {
            this.errorToast("Error!",data.error)
        }

    }

    generic_api_getreq(url,data,callback=false) {
        this.showLoading();
        url = this.urls["_api_prefix"] + url+"?d="+data;
        $.ajax({
            url:  url,
            method: 'GET',
            context: this,
            cache: false,
            contentType: false,
            processData: false
            }).done(this._generic_apiget_handle.bind(this,callback));
    }

    constructor(settings,urls,elements) {
      $.extend(this.settings,settings);
      $.extend(this.urls,urls);
      $.extend(this.elements,elements);
    }
}