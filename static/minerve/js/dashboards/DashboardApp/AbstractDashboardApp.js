export class    AbstractDashboardApp {
    settings = {
       "loading_toast":"#loading_toast",
        "nav-link-cls":[".nav-link",".nav-dlink"],
        "on_submit_complete":false,
        "toastSuccessCls":"toast-success"
    }
    urls = {

    }
    elements = {

    }
    modal = false
    last_modal_created = false
    last_modal_created_bso = false
    _parent_walker(parent,target_node) {
       if (target_node == undefined) { target_node = "DIV"};
       while (parent.nodeName != target_node) {
            parent = parent.parentElement;
        };
        return $(parent);

    }
    _getModal() {
        this.modal =  new bootstrap.Modal(this.elements["modal"]);
    }

    _showModal() {
        if (this.modal == false) {
            this._getModal();
        }
        this.modal.show();
    }
    _hideModal() {
        if (this.modal == false) {
            this._getModal();
        }
        this.modal.hide();
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
    _edit_form_loader(data) {
        var data_keys = Object.keys(data.data);

            for (var i in data_keys) {
                var dk = data_keys[i];
                var update_el = $(this.elements["form"]).find("#id_"+dk);
                if (update_el.length > 0) {
                    update_el[0].value = data.data[dk];
                }
           }
    }
     edit_handle(data,edit_function=false) {
        this.hideLoading();
        if (data.res == "ok") {
            this._edit_form_loader(data);
            this._showModal();

        } else {
                var errStr= this._parse_ajax_error(data);
                this.errorToast('<h6><i class="fa-solid fa-xmark"></i>&#160;Error!','An Error Occured! '+errStr);
                console.error("Unable to execute Operation: ",errStr)
                return false;
            }
    }

    edit_record(uuid) {
          console.info("Loading Data for Edit Mode for '"+uuid+"'");
          this.showLoading();
          this.elements["modal"] = $(this.settings["modal_id"]);
          this.elements["form"] = $(this.settings["edit_form_id"]);
          $(this.settings["edit_form_id"])[0].reset();
          let url = this.urls["_api_prefix"]+this.elements["form"].data("get-url")+"/"+uuid;
          this._clear_invalid();
          console.log(this.elements["modal"],this.elements["form"],this.settings["modal_id"],this.settings["modal_id"]);
          $.ajax({
              url:   url,
              method: 'GET',
              context: this
          }).done(this.edit_handle.bind(this));

    }
    _delete_handle(callback,data) {
        this.hideLoading();
        if (data.res == "ok") {
            this.successToast("Complete!","Record Deleted!")
            $(this.settings.dashboard_panel).load(this._current_url);
            if (callback != false) {
                callback();
            }
        } else {
            this.errorToast("Error!",data.err)
        }
    }

    delete_record(uuid, form_element=false,callback=false) {
        if (confirm("Are you sure you want to delete this record?")) {
            this.showLoading();
            if (form_element == false) {
                this.elements["form"] = $(this.settings["edit_form_id"]);
            } else {
                this.elements["form"] = form_element
            }

            let url = this.urls["_api_prefix"]+this.elements["form"].data("delete-url")+"/"+uuid;
            $.ajax({
                  url:   url,
                method: 'GET',
                context: this
            }).done(this._delete_handle.bind(this,callback));
        }
    }
    _confirm_and_get_ajax_url_handle(callback,data) {
        this.hideLoading();
        if (data.res == "ok") {
            this.successToast("Complete!","Operation Complete!");

            if (callback != false) {
                callback();
            }
        } else {
            this.errorToast("Error!",data.err)
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

     successToast(header,body) {
        new bs5.Toast({
		body: body,
		header: header,
		className: this.settings.toastSuccessCls,
	}).show();
    }
    errorToast(header,body) {
        new bs5.Toast({
		body: body,
		header: header,
		className: this.settings.toastErrorCls,

	}).show();
    }

    normalToast(header,body) {
        new bs5.Toast({
		body: body,
		header: header,
		className: this.settings.toastCls,

	}).show();
    }

    // Loading Toast:
    showLoading() {
        this.elements["loading_toast"].show();
    }
    hideLoading(callback) {
        this.elements["loading_toast"].hide();
        if (typeof(callback) == "function") {
            callback();
        }
    }
    refresh() {
        $(this.settings.dashboard_panel).load(this._current_url);
    }

    load_page(event) {
        event.preventDefault();
        event.stopPropagation();
        // console.log("Event Catch Load Page",event,event.target)
        var trgturl = $(event.target).data("target-url");
        if (trgturl == undefined) {
            return false;
        }
        this.showLoading();

        let target_url = this.urls["_prefix"] + trgturl;

        this._current_url = target_url;
        if ($(event.target).data("target-form-url") !== undefined) {
            let form_target_url = this.urls["_prefix"] + $(event.target).data("target-form-url");
            $(this.settings.dashboard_form_area).load(form_target_url);
            this.elements["form"] = $(this.settings.dashboard_form_area);
        }
        $(this.settings.dashboard_panel).load(target_url,false,this.hideLoading.bind(this));
        try {
            $(this._parent_walker($(event.target)[0])[0].parentNode).offcanvas('hide');
        } catch (e) {}
    }

    _submit_form_handle(data) {
        this.hideLoading();
        if (data.res == "ok") {
            this.successToast("Complete!","Operation Complete!");
            $(this.settings["edit_form_id"])[0].reset();
            try {
                this.elements["modal"].hide();
            } catch (e) {
                console.info("Could not close modal dialog.");
            }
            if (this.settings.on_submit_complete === false) {
                $(this.settings.dashboard_panel).load(this._current_url);
            } else{
                this.settings.on_submit_complete();
            }
        } else {
            this.errorToast("Error!",data.err)
        }


    }

    submit_form(event,handler) {
        event.stopPropagation();
        event.preventDefault();
        this.showLoading();
        this.elements["modal"] = $(this.settings["modal_id"]);
        this.elements["form"] = $(this.settings["edit_form_id"]);
        try {
            this._getModal();
        } catch (e) {
            console.info("No Modal Detected during submit_form.");
        }
        let url = this.urls["_api_prefix"] + this.elements["form"].data("post-url");
        $.ajax({
            url:  url,
            data:     new FormData(this.elements["form"][0]),
            method: 'POST',
            context: this,
            cache: false,
            contentType: false,
            processData: false
            }).done(this._submit_form_handle.bind(this));
    }
     load_detail_view(event) {
        event.preventDefault();
        event.stopPropagation();
        let form = $(event.target);
        let loadval = $(this.settings.detail_item_select)[0].value;
        let url = form.data("detail-url")+"/"+loadval;
        $(this.settings.detail_item_card).load(url);
        $(this.settings.detail_view_modal_sel).modal('hide');
    }
    start_detail_view() {
        $(this.settings.detail_view_modal_sel).modal('show');
    }

    _modal_div_factory(title_str,max_width,dismissable=true,css_class=false) {
        let modalId = Math.floor( Date.now() / 1000 );
        let modalDiv = $("<div>",{class:"modal",id:modalId});
        if (css_class !== false) {
            modalDiv.addClass(css_class);
        }
        let modalBody = $("<div>",{class:"modal-body",text:"...Loading..."});
        let dialog = $("<div>",{class:"modal-dialog",css:{"max-height":"95%","overflow-y":"auto"}});
        if (max_width !== false) {
            dialog.css({'width':max_width,'max-width':max_width});
        }
        let content = $("<div>",{class:"modal-content"});
        let header = $("<div>",{class:"modal-header"});
        let title = $("<div>",{class:"modal-title h4",html:title_str});
        let footer = $("<div>",{class:"modal-footer"});
        header.append(title);
        if (dismissable == true) {
            let xbtn = $("<button>", {
                class: "btn-close",
                type: "button",
                "data-bs-dismiss": "modal",
                "data-bs-target": "#" + modalId
            });
            let clsbtn = $("<button>",{class:"btn btn-secondary",type:"button",text:"Close","data-bs-dismiss":"modal","data-bs-target":"#"+modalId});
            header.append(xbtn);
            footer.append(clsbtn);

        } else {
            modalDiv.attr('data-bs-backdrop','static');
            modalDiv.attr('data-bs-keyboard','false');
        }

        content.append(header);
        content.append(modalBody);
        content.append(footer);
        dialog.append(content);

        modalDiv.append(dialog);
        $(document.body).append(modalDiv);
        return [modalDiv,modalBody];
    }


    generic_ajax_modal_dialogue(title, url, add_prefix=false,max_width="75%",dismissable=true,load_callback=false,modal_css_class=false,destroy_old_modal=false) {
            if (destroy_old_modal === true) {
                if (this.last_modal_created !== false) {
                    $(this.last_modal_created).remove();
                }
            }
            let modal = this._modal_div_factory(title,max_width,dismissable,modal_css_class);

            let bso = new bootstrap.Modal(modal[0]);

            let turl = url;
            if (add_prefix === true) {
                turl = this.urls["_prefix"] + turl;
            }
            this.showLoading();
            modal[1].load(turl,false,this.hideLoading.bind(this,load_callback));
            modal[0].on("hidden.bs.modal",function(event){
                $(event.target).remove();

            });
            bso.show();

            /** You might need these two things later :) **/
            this.last_modal_created = modal[0];
            this.last_modal_created_bso = bso;
            return [modal[0],bso]
    }

    generic_post_form_handle(modal,callback,res) {
        if (res.res == "ok") {
            if (modal !== false) {
                $(modal).modal('hide');
            }
            if (!("silent" in res)) {
                if (res.msg !== false) {
                    this.successToast("Success!", res.msg);
                } else {
                    this.successToast("Success!", "Operation Complete!");
                }
            }
            if (callback !== false) {
                callback(res);
            }
        }  else {
            this.errorToast('Error!',res.err);
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
            this.errorToast("Error!",data.err)
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
      this.elements["loading_toast"] = new bootstrap.Toast($(this.settings.loading_toast));
      $(document).bind('loading',this.showLoading.bind(this));
      $(document).bind('loaded',this.hideLoading.bind(this));

    }

    bind_links() {
            for (let clsName of this.settings["nav-link-cls"]) {
                $(clsName).on("click", this.load_page.bind(this));
            }
    }
}