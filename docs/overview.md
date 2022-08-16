# 为什么有这个专栏

[React Hooks](https://reactjs.org/docs/hooks-intro.html) 新特性是 2019 年 2 月 6 日在 [v16.8.0](https://github.com/facebook/react/releases/tag/v16.8.0) 版本发布的，距离几天 2022 年 8 月 15 日，已经三年多了，受 [React Hooks](https://reactjs.org/docs/hooks-intro.html) 思想启发，Vue3 的 [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html) 在 [2020-09-18](https://github.com/vuejs/core/blob/main/CHANGELOG.md#300-2020-09-18) 也迎来了第一次正式发版。

无论是 [React Hooks](https://reactjs.org/docs/hooks-intro.html) 还是 [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html) 本质上思想都是一样的，这是一种新的编程模式，对前端界的革命性作用丝毫不亚于 MVVM 思想。

行文到此，不仅要问一句，那么早不出晚不出，为什么这个思想恰恰这个时候出现了呢，因为前端是一种实践性的语言，其实不止前端，整个编程界都是这样，遇见一个问题，然后解决它，在前一个方案的基础上，遇到新的问题……技术就像俄罗斯套娃式的向前发展。

比如说：古老的前端开发者最初是直接操作浏览器的 DOM，那个时候比较头疼的问题是 DOM 兼容问题，所以 JQuery 就出现了，JQuery 普及之后令开发者头疼的问题是操作数据和更新浏览器视图是分离的，网站复杂就容易出错，所以出现了 MVVM 思想**数据驱动视图**，但是你说数据与视图分离这个头疼的问题在操作 DOM 时代不存在吗，也存在不过那时候这个问题不重要。MVVM 时代虽然解决了数据与视图分离的问题，但是组件内的逻辑复用就令人头疼了。为此还出现了很多 hack 方法，什么 HOC、mixins……，这些方法都是挺复杂还不好用。

前端界急需要一场革命，这场革命就是 React Hooks。

如今，无论 [React Hooks](https://reactjs.org/docs/hooks-intro.html) 还是 [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html) 的 API 已经非常稳定，在这期间产生了很多最佳实践，编程中大量的常用逻辑不用我们自己完成。

[React Hooks](https://reactjs.org/docs/hooks-intro.html)最佳实践代码有 [ahooks](https://github.com/alibaba/hooks) [usehooks](https://github.com/uidotdev/usehooks) 等等，Vue3 [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html) 最佳实践代码有 [vueuse](https://github.com/vueuse/vueuse) 等等。

就像 [React Hooks](https://reactjs.org/docs/hooks-intro.html) 和 [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html) API 不同，但思想相同，两个框架产生的最佳实践代码也是不同的，但毫无疑问思想是相同的，熟练掌握这些最佳实践，可以让我们在实践中更好的抽象逻辑，从而快速实现业务落地更早下班。

最后站在 [React Hooks](https://reactjs.org/docs/hooks-intro.html) 或 [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html) 的角度下你觉得前端下场革命会是怎么样的呢？