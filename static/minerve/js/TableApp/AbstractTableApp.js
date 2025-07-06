import {AbstractApp} from "/static/minerve/js/core/AbstractApp.js";


export class AbstractTableApp extends AbstractApp {
    settings = {
        "table_class":"table table-striped table-hover table-responsive",
        "tr_class":"h6 text-primary",
        "pagination_size":15,
        "navigation_pill_count_box_break":10,
        "navigation_display_count":true,
        "navigation_display_status":true,
        "navigation_display_pbar":true,
        "display_cols": ["uuid","created","account","match","status","risk","win"]
    }
    urls = {
        "_api_prefix":"/api/v1/",
        "paginator_endpoint":"agent/wagers/reports/paginator/"
    }
    texts =  {
        "navigation_aria": "Table Navigation Range",
        "previous":"Previous",
        "next":"Next",
        "viewing":"Viewing ",
        "records":"records",
        "ready":"<i class=\"fa-regular fa-signal-stream\"></i> Ready!",
        "loading":"<i class=\"fa-solid fa-spinner fa-spin-pulse text-primary\"></i> Loading...",
        "error":"<i class=\"fa-duotone fa-solid fa-circle-exclamation text-red\"></i> Error!",

    }
    navigation = {
        "container":false,
        "previous": false,
        "next": false,
        "box": false,
        "buttons": {}
    }
    display_cols = []
    col_names = {}
    row_data = []
    total_records = 0
    total_pages = 0
    current_page = 0
    tag = false
    props = {}
    table = false
    dom_con = false
    header = false
    body = false
    footer = false
    footer_div = false
    dom_factory() {
        let dom_el = $("<"+this.tag+"/>",this.props);
        return dom_el;
    }
    get_el() {
        return this.table;
    }
    get_container() {
        return this.dom_con;
    }

    _add_row(data) {
        this.tag = "tr"
        this.props = {}
        let row_data = {
            "tr":this.dom_factory(),
            "tds":[]
        }
        this.tag = "td"
        for (let key in data) {
            switch (typeof(data[key])) {
                case "object":
                    this.props = {
                        "html":data[key].name,
                        "id":"td_"+key,
                        "data_id":data[key].id,
                        }
                break;
                default:
                    this.props = {
                        "html":data[key],
                        "id":"td_"+key
                        }
                break;
            }
            let td = this.dom_factory()
            row_data["tds"].push(td)
            row_data["tr"][0].append(td[0])
        }
        this.row_data.push(row_data)
        this.body[0].append(row_data["tr"][0])
        this.row_count++
    }

    _set_header(columns = []) {
        this.header.empty()
        this.tag = "tr"
        this.props = {}
        let tr = this.dom_factory();
        this.header.append(tr[0])
        this.tag = "td"
        for (let key in columns) {
            this.props = {"html": columns[key],"id":"col_"+key,"class":this.settings["tr_class"]}
            let td = this.dom_factory();
            tr[0].append(td[0])
        }
        this.col_names = columns;
    }

    _set_navigation(parent) {

        this.tag = "nav"
        this.props = {"aria-label":this.texts["navigation_aria"]}
        let foot_root = this.dom_factory()
        parent.append(foot_root[0])
        this.tag = "ul"
        this.props = {"class":"pagination"}
        this.navigation.container = this.dom_factory()
        foot_root[0].append(this.navigation.container[0])
        this.tag = "li"
        this.props = {"class":"page-item"}
        let prev = this.dom_factory()
        this.tag = "btn"
        this.props = {"class":"btn btn-primary me-1","text":this.texts["previous"],"data-page":"prev"}
        this.navigation.previous = this.dom_factory()
        this.navigation.previous.on("click",this._nav_btn_handle.bind(this));
        prev[0].append(this.navigation.previous[0])
        this.navigation.container.append(prev[0])
        this.tag = "li"
        this.props = {"class":"page-item"}
        let next = this.dom_factory()
        // Simple pill navigation below:
        if (this.total_pages < this.settings["navigation_pill_count_box_break"]) {
            let i = 1;

            while (i <= this.total_pages) {
                this.tag = "li"
                this.props = {"class":"page-item"}
                let lli = this.dom_factory()
                this.tag = "btn"
                let btn_class ="btn-success"
                if (i%2 != 0) {
                    btn_class="btn-primary"
                }
                this.props = {"class":"btn ps-2 pe-2 ms-1 me-1 "+btn_class,"text":i,"data-page":i}
                let lah = this.dom_factory()
                lli[0].append(lah[0])
                this.navigation.container.append(lli[0])
                this.navigation.buttons[i] = lah;
                lah.on("click",this._nav_btn_handle.bind(this));
                i++;
            }
        // Too long! Interactive Input and multibutton support below:
        } else {
            let i = 1;
            while (i <= 3) {
                this.tag = "li"
                this.props = {"class":"page-item"}
                let lli = this.dom_factory()
                this.tag = "btn"
                let btn_class ="btn-success"
                if (i%2 != 0) {
                    btn_class="btn-primary"
                }
                this.props = {"class":"btn ps-2 pe-2 ms-1 me-1 "+btn_class,"text":'-',"data-page":i}
                let lah = this.dom_factory()
                lli[0].append(lah[0])
                this.navigation.container.append(lli[0])
                this.navigation.buttons[i] = lah;
                lah.on("click",this._nav_btn_handle.bind(this));
                i++;
            }
            this.tag = "input"
            this.props ={"type":"number","class":"form-control pt-0 pb-0 mt-0 mb-0","id":"current_nav","style":"max-width: 10vh;","max":this.total_pages, "min":1}
            this.navigation.box = this.dom_factory()
            this.navigation.box.on("change",this._nav_btn_handle.bind(this));
            this.navigation.container.append(this.navigation.box[0])
            while (i <= 6) {
                this.tag = "li"
                this.props = {"class":"page-item"}
                let lli = this.dom_factory()
                this.tag = "btn"
                let btn_class ="btn-success"
                if (i%2 != 0) {
                    btn_class="btn-primary"
                }
                this.props = {"class":"btn ps-2 pe-2 ms-1 me-1 "+btn_class,"text":'-',"data-page":i}
                let lah = this.dom_factory()
                lli[0].append(lah[0])
                this.navigation.container.append(lli[0])
                this.navigation.buttons[i] = lah;
                lah.on("click",this._nav_btn_handle.bind(this));
                i++;
            }
        }

        this.tag = "btn"
        this.props = {"class":"btn btn-primary ms-1","text":this.texts["next"],"data-page":"next"}
        this.navigation.next = this.dom_factory()
        this.navigation.next.on("click",this._nav_btn_handle.bind(this));
        next[0].append(this.navigation.next[0])
        this.navigation.container.append(next[0])


    }

    _set_status(text) {
        if (this.navigation.status_display) {
            $(this.navigation.status_display).html(text);
        }
    }
    _set_display_count(page) {
        if (this.navigation.display_count) {
            let ntext = this.texts["viewing"]+" "+page*this.settings["pagination_size"]+"/"+this.total_records+" "+this.texts["records"]
            this.navigation.display_count.text(ntext);
        }
        if (this.navigation.display_pbar_bar) {
            let progress = ((page*this.settings["pagination_size"]) / this.total_records)*100;
            this.navigation.display_pbar_bar[0].style.width = progress+"%";
        }
    }
    _set_footer() {
        this.footer_div.empty()
        this.tag = "div"
        this.props = {"class":"d-flex justify-content-between"}
        let nav_box = this.dom_factory()
        this.props = {}
        let nav_ctrls = this.dom_factory()
        this.footer_div[0].append(nav_box[0])
        nav_box[0].append(nav_ctrls[0])
        this._set_navigation(nav_ctrls[0]);
        if (this.settings["navigation_display_count"] == true) {
            this.tag = "div"
            this.props = {"text":this.texts["viewing"]+" "+this.current_page*this.settings["pagination_size"]+"/"+this.total_records+" "+this.texts["records"]}
            this.navigation.display_count = this.dom_factory()
            nav_box[0].append(this.navigation.display_count[0])
        }
        if (this.settings["navigation_display_pbar"] == true) {
            this.tag = "div"
            this.props = {"class":"progress col-2","role":"progressbar","aria-label":"Table row record progress","aria-valuenow":this.current_page*this.settings["pagination_size"],"aria-valuemin":0,"aria-valuemax":this.total_records}
            this.navigation.display_pbar = this.dom_factory()
            this.props = {"class":"progress-bar progress-bar-striped progress-bar-animated progress-bar-success","style":"width: 50%"}
            this.navigation.display_pbar_bar = this.dom_factory()
            this.navigation.display_pbar[0].append(this.navigation.display_pbar_bar[0])
            nav_box[0].append(this.navigation.display_pbar[0])
        }
        if (this.settings["navigation_display_status"] == true) {
            this.tag = "div"
            this.props = {}
            this.navigation.status_display = this.dom_factory()
            this._set_status(this.texts["ready"])
            nav_box[0].append(this.navigation.status_display[0])

        }
    }

    _nav_btn_handle(event) {
        // console.log("nav_btn_handle")
        event.preventDefault()
        event.stopPropagation()
        let btn = $(event.target);
        console.warn(btn,btn[0].value);
        if (btn[0].getAttribute("disabled") == "disabled") {
            return false;
        }
        let trgt = ""
        if (btn[0].value != undefined) {
            trgt = btn[0].value;
        } else {
            trgt = btn.data("page");
        }
        if (trgt >= this.total_pages) {
            console.warn("Exceeding total pages is prohibited.")
            btn[0].value = this.total_pages;
            trgt = this.total_pages;
        }

        let page = this.current_page;
         if ((trgt == "prev") && (this.current_page > 1)){
            page = this.current_page - 1;
        } else if ((trgt == "next") && (this.current_page < this.total_pages )) {
             console.log("Next")
             page = this.current_page + 1;
            } else if (trgt*1>=1) {
            page = trgt * 1
        }
        this.load(page);
    }

    _load_handle(res) {
        if (res.data.paginator.current_page == 1) {
            this.header.empty()
            this._set_header(Object.values(res.data.column_names))
        }
        this.body.empty()
        for (let key in res.data.rows) {
            this._add_row(res.data.rows[key]);
        }
        this.navigation.container.find("btn").removeClass('disabled');
        this.navigation.container.find("btn").attr('disabled',false);
        this.current_page = res.data.paginator.current_page;
        // Simple Pill based navigation below:
        if (this.total_pages < this.settings["navigation_pill_count_box_break"]) {
        this.navigation.buttons[this.current_page].attr("disabled","disabled");
        this.navigation.buttons[this.current_page].addClass("disabled");
        if (this.current_page == 1) {
            this.navigation.previous.attr("disabled", "disabled");
            this.navigation.previous.addClass("disabled");
        }
        if (this.current_page == this.total_pages) {
            this.navigation.next.attr("disabled","disabled");
            this.navigation.next.addClass("disabled");
        }
        // console.log("Page is now",this.current_page)
        } else {
            // Interactive Box and Pill navigation:
            this.navigation.box[0].value = this.current_page;
            this.navigation.container.find("btn").addClass('disabled');
            this.navigation.container.find("btn").attr('disabled','disabled');
            if (this.current_page == 1) {
                this.navigation.previous.attr("disabled", "disabled");
                this.navigation.previous.addClass("disabled");
            } else {
                this.navigation.previous.attr("disabled",false);
                this.navigation.previous.removeClass("disabled");
            }
            if (this.current_page == this.total_pages) {
                this.navigation.next.attr("disabled","disabled");
                this.navigation.next.addClass("disabled");
            } else {
                this.navigation.next.attr("disabled",false);
                this.navigation.next.removeClass("disabled");
            }
            let btn1 = $(this.navigation.buttons[1][0]);
            if (this.current_page  <= 3) {
                btn1.attr("disabled","disabled");
                btn1.addClass("disabled");
                btn1.text("-");

            } else {
                btn1.attr("disabled",false);
                btn1.removeClass("disabled");
                btn1.text(this.current_page-3);
                btn1.data("page",this.current_page-3);
            }
            let btn2 = $(this.navigation.buttons[2][0]);
            if (this.current_page  <= 2) {
                btn2.attr("disabled","disabled");
                btn2.addClass("disabled");
                btn2.text("-");
            } else {
                btn2.attr("disabled",false);
                btn2.removeClass("disabled");
                btn2.text(this.current_page-2);
                btn2.data("page",this.current_page-2);
            }
            let btn3 = $(this.navigation.buttons[3][0]);
            if (this.current_page  <= 1) {
                btn3.attr("disabled","disabled");
                btn3.addClass("disabled");
                btn3.text("-");
            } else {
                btn3.attr("disabled",false);
                btn3.removeClass("disabled");
                btn3.text(this.current_page-1);
                btn3.data("page",this.current_page-1);
            }
            let btn4 = $(this.navigation.buttons[4][0]);
            if (this.current_page + 1 >= this.total_pages) {
                btn4.attr("disabled","disabled");
                btn4.addClass("disabled");
                btn4.text("-");
            } else {
                btn4.attr("disabled",false);
                btn4.removeClass("disabled");
                btn4.text(this.current_page+1);
                btn4.data("page",this.current_page+1);
            }
            let btn5 = $(this.navigation.buttons[5][0]);
            if (this.current_page + 2 >= this.total_pages) {
                btn5.attr("disabled","disabled");
                btn5.addClass("disabled");
                btn5.text("-");
            } else {
                btn5.attr("disabled",false);
                btn5.removeClass("disabled");
                btn5.text(this.current_page+2);
                btn5.data("page",this.current_page+2);
            }
            let btn6 = $(this.navigation.buttons[6][0]);
            if (this.current_page + 3 >= this.total_pages) {
                btn6.attr("disabled","disabled");
                btn6.addClass("disabled");
                btn6.text("-");
            } else {
                btn6.attr("disabled",false);
                btn6.removeClass("disabled");
                btn6.text(this.current_page+3);
                btn6.data("page",this.current_page+3);
            }
            this._set_display_count(this.current_page);
            this._set_status(this.texts["ready"])

        }

    }

    load(page=1) {
        let cols = this.columns.join(",")
        if (this.display_cols.length > 0) {
            cols = this.display_cols.join(",")
        }
        console.log("Loading Page: "+page);
        this._set_status(this.texts["loading"])
        this.generic_api_getreq(this.urls["paginator_endpoint"]+this.settings["pagination_size"]+"/"+page,"cols="+cols,this._load_handle.bind(this));
    }


    _start_handle(res) {
        // console.log("Table Data",data.paginator);
        // console.log(data);
        this.total_records = res.paginator.total_records;
        this.current_page = res.paginator.current_page;
        this.total_pages = res.paginator.total_pages;
        this.columns = res.columns;
        console.log("Initalised a Table with "+this.total_records+" records across "+this.total_pages+" total pages of "+this.settings["pagination_size"]+" rows each.");
        // if (this.total_pages > 1) {
        this._set_footer()
        // }
        this.load(1);


    }

    start() {
        this.generic_api_getreq(this.urls["paginator_endpoint"],false,this._start_handle.bind(this));
    }
    constructor(settings, urls, texts) {
        super(settings, urls);
        $.extend(this.settings, settings);
        $.extend(this.urls, urls);
        $.extend(this.texts, texts);
        this.display_cols = this.settings["display_cols"];
        this.tag = "div"
        this.props = {};
        this.dom_con = this.dom_factory();
        this.tag = "table"
        this.props = {
            "class": this.settings["table_class"],
        }
        this.table = this.dom_factory();
        this.dom_con[0].append(this.table[0]);
        this.props = {}
        this.tag = "thead"
        this.header = this.dom_factory();
        this.tag = "tbody"
        this.body = this.dom_factory();
        this.tag = "tfoot"
        this.footer = this.dom_factory();
        this.table[0].append(this.header[0],this.body[0],this.footer[0]);
        this.tag = "div"
        this.footer_div = this.dom_factory();
        this.dom_con[0].append(this.footer_div[0]);





    }

}