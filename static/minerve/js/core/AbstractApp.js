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
        if (typeof data == "string") {
             errStr = data;

        } else {
            var errors = data.e;
            for (var eks in errors) {
                if (typeof (errors[eks][0]) != "string") {
                    errStr = errStr + " <em>" + eks + "</em>: " + errors[eks][0]["message"] + "<br/>";
                } else {
                    errStr = errStr + " <em>" + eks + "</em>: " + errors[eks][0] + "<br/>";
                }
                $(this.elements["form"]).find("#id_" + eks).addClass('is-invalid');
            }
        }
        return errStr;
    }
    _confirm_and_get_ajax_url_handle(callback,data) {
        $(this).trigger("hideLoading");
        if (data.res == "ok") {
            console.log("Complete!","Operation Complete!");

            if (callback != false) {
                callback();
            }
        } else {
            console.error("Error!",data.error)
        }
    }
    confirm_and_get_ajax_url(surl,callback,confirm_msg) {
        if  (confirm(confirm_msg)) {
            $(this).trigger("showLoading");
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
            $(this).trigger("showLoading");
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
           var errorstr = this._parse_ajax_error(res.data);
           console.error('Error!',errorstr);
        }
    }

    _clear_invalid() {
        $(this.elements["form"]).find("input").removeClass('is-invalid');
        $(this.elements["form"]).find("select").removeClass('is-invalid');
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
        this._clear_invalid()
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
        $(this).trigger("hideLoading");
        // console.log(callback,data);
        if (data.res == "ok") {
            if (!("silent" in data))
            {
                $(this).trigger("success")
            }
            if (callback !== false) {

                callback(data);
            }
        } else {
            console.error("Error!",data.error)
        }

    }

    generic_api_getreq(url,data,callback=false,bind=true) {

        url = this.urls["_api_prefix"] + url+"?"+data;
        if (bind === true) {
            callback = this._generic_apiget_handle.bind(this,callback)
        }
        $.ajax({
            url:  url,
            method: 'GET',
            context: this,
            cache: false,
            contentType: false,
            processData: false
            }).done(callback);
    }

   get_cookie(name) {
        let cookieValue = null;
          if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let c of cookies) {
              const cookie = c.trim();
              // Does this cookie string begin with the name we want?
              if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
              }
            }
          }
          return cookieValue;
        }
    constructor(settings,urls,elements) {
      $.extend(this.settings,settings);
      $.extend(this.urls,urls);
      $.extend(this.elements,elements);
      const csrftoken = this.get_cookie('csrftoken'); // or whatever your token is named
      $.ajaxSetup({
          beforeSend: function (xhr, settings) {
              // Only add CSRF token to same-origin requests
              if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                  xhr.setRequestHeader("X-CSRFToken", csrftoken);
              }
          }
      })
    }
}