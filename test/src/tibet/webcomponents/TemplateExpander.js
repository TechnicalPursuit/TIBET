/* eslint-disable */
// Create a class for the element
class TemplateExpander extends HTMLElement {
    connectedCallback() {
        var template;

        template = document.getElementById(this.nodeName);

        //  This will create one instance, replacing our innerHTML.
        this.innerHTML = template.innerHTML;

        //  This will append a second one using the append/cloneNode technique.
        this.append(template.content.cloneNode(true));
    }
}

// Define the new element
customElements.define('template-expander', TemplateExpander);
/* eslint-enable */
