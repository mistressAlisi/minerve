import {_elementProto} from "./prototype.js";

export class ElementForm extends _elementProto {

    constructor(post_url,method="POST",target="#",on_submit=false,on_change=false,...rest) {
        console.warn(post_url,method,rest);
        super();
        this.tag = "form";
        this.props = {
            "method": method,
            "data-post-url": post_url,
            "target": target,
        }

        console.log(this.props);
        this.dom_el = this.dom_factory();
        if ("intro_str" in rest) {
            this.intro_str = $("<div>", {class: "p", html: rest.intro_str});
            this.content.append(this.intro_str);
        }
        if (on_submit != false) {
            this.dom_el.on("submit", on_submit);
        };
        if (on_change != false) {
            this.dom_el.on("change", on_change);
        };

    }
}