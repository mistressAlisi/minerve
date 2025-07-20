import {_elementProto} from "./prototype.js";

export class ElementInput extends _elementProto {
    container = false;
    label = false;
    input = false;
    help = false;

    get_el() {
        return this.container;
    }
    constructor(id,type="text",{...props}) {
        super()
        /** Build the container first: **/
        this.tag = "div"
        this.props = {"class": "mb-3"}
        if ("container_class" in props) {
            this.props["class"] = this.props["class"]+" "+props["container_class"];
        }
        this.container = this.dom_factory();

        /** Now the label: **/
        this.tag = "label"
        this.props = {
            "for": id,
            "class": "form-label"
        }
        if ("verbose_name" in props){
            this.props["text"] = props["verbose_name"];
        } else {
            this.props["text"] = id;
        }
        this.label = this.dom_factory();
        // console.warn(this.label,this.props);
        this.container.append(this.label);
        this.tag = "input";
        this.props = {
            "id": "id_"+id,
            "name":id,
            "type": "text",
            "class":"form-control",
            "aria-describedby": id+"help"
        }

        $.extend(this.props, props);
        if ("input_class" in props) {
            this.props["class"] = this.props["class"] + " " + props["input_class"]
        }
        this.input = this.dom_factory();
        this.container.append(this.input);
        this.tag = "div"
        this.props = {
            "id":id+"help",
            "class":"form-text",
            "text":""
        }
        if ("help_text" in props){
            this.props["text"] = props["help_text"];
        }
        this.help = this.dom_factory();
        this.container.append(this.help);

        if ('on_submit' in props) {
            this.dom_el.on("submit", props["on_submit"]);
        };
        if ('on_change' in props) {
            this.dom_el.on("change", props["on_change"]);
        };

    }
}