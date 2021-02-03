declare module 'vue-material/dist/components' {

    import _Vue from "vue"; // <-- notice the changed import
  
    // export type PluginFunction<T> = (Vue: typeof _Vue, options?: T) => void;
    export function MdField(Vue: typeof _Vue, options?: any): void 
    export function MdButton(Vue: typeof _Vue, options?: any): void 
    export function MdContent(Vue: typeof _Vue, options?: any): void 
    export function MdTabs(Vue: typeof _Vue, options?: any): void 
    export function MdDatepicker(Vue: typeof _Vue, options?: any): void 
    
  }