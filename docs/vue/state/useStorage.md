# useStorage

::: tip
开始前请熟悉掌握浏览器的 [Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) API。
:::

## 简单使用

```js
// bind object
const state = useStorage('my-store', { hello: 'hi', greeting: 'Hello' })

// bind boolean
const flag = useStorage('my-flag', true) // returns Ref<boolean>

// bind number
const count = useStorage('my-count', 0) // returns Ref<number>

// bind string with SessionStorage
const id = useStorage('my-id', 'some-string-id', sessionStorage) // returns Ref<string>

// delete data from storage
state.value = null
```

useStorage 的参数参考 [Storage.setItem()](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem)	API，第一个参数是 keyName 表示要创建或更新的键名, 第二个参数 keyValue 表示要创建或更新的键名对应的值。

## 简单实现

为了使用方便，useStorage 管理的 keyValue 肯定是一个响应式变量，这样做的好处在于：

1. useStorage 的返回值是一个 Ref 对象，可以直接访问到 keyValue 的值，相当于 [Storage.getItem()](https://developer.mozilla.org/zh-CN/docs/Web/API/Storage/getItem)。
2. 直接对 useStorage 返回的 Ref 对象赋值，相当于 [Storage.setItem()](https://developer.mozilla.org/zh-CN/docs/Web/API/Storage/setItem)。
3. 直接把 useStorage 返回的 Ref 对象赋值为 null，相当于 [Storage.removeItem()](https://developer.mozilla.org/zh-CN/docs/Web/API/Storage/removeItem)。

可以看到我们对变量做些赋值操作，就可以实现对 Storage 的增删查改，这种方便程度是在让人心动。

### useStorage 返回值设置为 Ref 对象

```js
import { ref } from "vue";

export function useStorage(keyName, keyValue) {
	const refKeyValue = ref(keyValue);
	return refKeyValue;
}
```

演示：

![image](https://user-images.githubusercontent.com/47056890/185280656-32a0c36e-3c37-454e-8ee7-fae3ca8c3690.png)

### 实现 [Storage.getItem()](https://developer.mozilla.org/en-US/docs/Web/API/Storage/getItem)

:::tip
注意这里的 Storage 上下文我默认设置为 localStorage，你肯定会好奇为啥这个 use 不叫 useLocalStorage 而是叫 useStorage，原因请看 [localStorage or sessionStorage](#localstorage-or-sessionstorage)
:::

所以现在假设数据存储在 localStorage 中，利用当 key 不存在，getItem 方法返回 null 那么我们可以实现如下代码：

```js
export function useStorage(keyName, keyValue) {
	const storage = globalThis.localStorage;
	const getState = () => {
		const storageValue = storage.getItem(keyName);
		return storageValue ?? keyValue;
	}
	const refKeyValue = ref(getState());
	return refKeyValue;
}
```

### 实现 [Storage.setItem()](https://developer.mozilla.org/zh-CN/docs/Web/API/Storage/setItem)

```js{10}
import { ref } from "vue";

export function useStorage(keyName, keyValue) {
	const storage = globalThis.localStorage
	const getState = () => {
		const storageValue = storage.getItem(keyName);
		return storageValue ?? keyValue;
	}
	const refKeyValue = ref(getState());
	storage.setItem(keyName, refKeyValue.value);
	return refKeyValue;
}
```

这么实现太简单了，我们知道 setItem 其实是包含更新和创建两个功能的，把这两个功能抽象成一个函数 write（没有叫 create 函数的原因）。

现在函数变成了这样：

```js{10-13}
import { ref, watch } from "vue";

export function useStorage(keyName, keyValue) {
	const storage = globalThis.localStorage
	const getState = () => {
		const storageValue = storage.getItem(keyName);
		return storageValue ?? keyValue;
	}
	const refKeyValue = ref(getState());
	const write = (v) => {
		storage.setItem(keyName, v);
	}
	watch(refKeyValue, () => write(refKeyValue.value), { immediate: true });
	return refKeyValue;
}
```

### 实现 [Storage.removeItem()](https://developer.mozilla.org/zh-CN/docs/Web/API/Storage/removeItem)

write 函数增加一个条件判断，当 write 的值为 null 时调用 Storage.removeItem() 删除 keyName 对应的键值。

```js{11-15}
import { ref, watch } from "vue";

export function useStorage(keyName, keyValue) {
	const storage = globalThis.localStorage
	const getState = () => {
		const storageValue = storage.getItem(keyName);
		return storageValue ?? keyValue;
	}
	const refKeyValue = ref(getState());
	const write = (v) => {
		if(v === null) {
			storage.removeItem(keyName);
		} else {
			storage.setItem(keyName, v);
		}
	}
	watch(refKeyValue, () => write(refKeyValue.value), { immediate: true });
	return refKeyValue;
}
```

## [添加 Storage 事件](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#responding_to_storage_changes_with_the_storageevent)

无论是 localStorage 还是 sessionStorage，我们都可以在其他地方对它们进行增删查改，比如：

- sessionStorage：在当前页面，打开浏览器的控制面板，无论是通过 sessionStorage API 还是直接在 Application 面板直接对数据增删查改，都会导致页面和浏览器存储的数据不一致。

- localStorage：我们打开两个 tab 页，在一个页面修改 localStorage 会导致另一个页面的 localStorage 也被修改，这样两个页面的数据就不一致了。

解决办法就是通过监听 Storage 事件做实时修改同步。

::: tip 注意📢
**当前页面直接修改 Storage 的数据不会触发 Storage 事件**，要想生效必须满足下面条件：
- localStorage
	1. 当前页面，直接用控制面板修改 localStorage。
	2. 非无痕模式，打开另一个 tab 页，修改 localStorage。
- sessionStorage
	1. 当前页面，直接用控制面板修改 localStorage。
:::

```js{18-31}
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

export function useStorage(keyName, keyValue) {
	const storage = globalThis.localStorage;
	const getState = () => {
		const storageValue = storage.getItem(keyName);
		return storageValue ?? keyValue;
	}
	const refKeyValue = ref(getState());
	const write = (v) => {
		if(v === null) {
			storage.removeItem(keyName);
		} else {
			storage.setItem(keyName, v);
		}
	}

	const update = (event) => {
		// 判断修改的 key 是否是当前 keyName
		if(event && event.key === keyName) {
			refKeyValue.value = event.newValue;
		}
	};

	onMounted(() => {
		globalThis.addEventListener("storage", update);
	});

	onBeforeUnmount(() => {
		globalThis.addEventListener("storage", update);
	});

	watch(refKeyValue, () => write(refKeyValue.value), { immediate: true });
	return refKeyValue;
}
```

## 序列化

上面案例存储的 keyValue 我们一直用的是一个字符串，但是我们知道 Storage 存储的 key 和 value 都是**字符串**，如果不是字符串，默认自动转换，比如数字 8 会自动转成字符串 8，一个对象会被转换成 `'[object Object]'`等等，为了便捷使用，所以需要**写入时进行序列化，取出时反序列化**。

我们使用 `Object.prototype.toString.call` 方法查看存在数据的类型，如果是**数字、字符串、布尔值、日期、函数、数组、正则、对象**，则返回相应的字符串，结果如下图所示：

![image](https://user-images.githubusercontent.com/47056890/185526027-ce5a7046-26e3-40f5-8c8d-c07672d76745.png)

新建一个 guess 文件，导出函数 guessSerializerType：

```js{13-16}
const getType = new Map([
	["[object String]", "string"],
	["[object Number]", "number"],
	["[object BigInt]", "bigint"],
	["[object Boolean]", "boolean"],
	["[object Object]", "object"],
	["[object Array]", "array"],
	["[object Date]", "date"],
	["[object Set]", "set"],
	["[object Map]", "map"],
	["[object RegExp]", "regexp"],
	["[object Undefined]", "undefined"],
	["[object Symbol]", "symbol"],
	["[object Null]", "null"],
	["[object Function]", "function"],
	["[object Error]", "error"],
])

export function guessSerializerType(rawInit) {
	return getType.get(Object.prototype.toString.call(rawInit))
}
```

我们考虑下 getType 设计的是否合理有没有必须要这么多类型，主要是上面代码高亮的部分，function 和 error 实在是没必要，Symbol 不好实现，getItem 获取不存在的 key 返回 null 所以如果我们存储的 Null 就冲突了。

于是，最终代码如下：

```js{16}
const getType = new Map([
	["[object String]", "string"],
	["[object Number]", "number"],
	["[object BigInt]", "bigint"],
	["[object Boolean]", "boolean"],
	["[object Object]", "object"],
	["[object Array]", "array"],
	["[object Date]", "date"],
	["[object Set]", "set"],
	["[object Map]", "map"],
	["[object RegExp]", "regexp"],
	["[object Undefined]", "undefined"],
])

export function guessSerializerType(rawInit) {
	return getType.get(Object.prototype.toString.call(rawInit)) ?? "any"
}
```

现在假设我们现在要存储一个对象，`guessSerializerType({ name: "John" })` 返回的结果为 `object`，

1. 第一，setItem 需要将对象转换成字符串，然后再存储，需要一个 write API。
2. getItem 需要把字符串转换成对象，需要一个 read API。

我们这样设计：

```js
export const storageSerializers = {
	object: {
		read: v => JSON.parse(v),
		write: v => JSON.stringify(v),
	}
}
```

补全其他类型：

```js
export const storageSerializers = {
	boolean: {
		read: (v) => v === "true",
		write: (v) => String(v),
	},
	object: {
		read: (v) => JSON.parse(v),
		write: (v) => JSON.stringify(v),
	},
	array: {
		read: (v) => JSON.parse(v),
		write: (v) => JSON.stringify(v),
	},
	number: {
		read: (v) => Number.parseFloat(v),
		write: (v) => String(v),
	},
	bigint: {
		read: (v) => BigInt(v),
		write: (v) => String(v),
	},
	string: {
		read: (v) => v,
		write: (v) => String(v),
	},
	map: {
		read: (v) => new Map(JSON.parse(v)),
		write: (v) => JSON.stringify(Array.from(v.entries())),
	},
	set: {
		read: (v) => new Set(JSON.parse(v)),
		write: (v) => JSON.stringify(Array.from(v)),
	},
	date: {
		read: (v) => new Date(v),
		write: (v) => v.toISOString(),
	},
	regexp: {
		read: (v) => new RegExp(v),
		write: (v) => String(v),
	},
	undefined: {
		read: (v) => undefined,
		write: (v) => String(v),
	},
	any: {
		read: (v) => v,
		write: (v) => String(v),
	},
}
```

项目中就可以这样使用了：

```js
const serializer = storageSerializers[guessSerializerType(keyValue)];
```

OK，来替换之前的代码，主要是 getItem 和 setItem：

```js
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

export function useStorage(keyName, keyValue) {
	const storage = globalThis.localStorage;
	const serializer = storageSerializers[guessSerializerType(keyValue)];
	const getState = () => {
		const storageValue = serializer.read(storage.getItem(keyName));
		return storageValue ?? keyValue;
	}
	const refKeyValue = ref(getState());
	const write = (v) => {
		if(v === null) {
			storage.removeItem(keyName);
		} else {
			storage.setItem(keyName, serializer.write(v));
		}
	}

	const update = (event) => {
		// 判断修改的 key 是否是当前 keyName
		if(event && event.key === keyName) {
			refKeyValue.value = event.newValue;
		}
	};

	onMounted(() => {
		globalThis.addEventListener("storage", update);
	});

	onBeforeUnmount(() => {
		globalThis.addEventListener("storage", update);
	});

	watch(refKeyValue, () => write(refKeyValue.value), { immediate: true, deep: true });
	return refKeyValue;
}
```

## [Storage.length](https://developer.mozilla.org/en-US/docs/Web/API/Storage/length)、[Storage.clear()](https://developer.mozilla.org/en-US/docs/Web/API/Storage/clear) 和 [Storage.key()](https://developer.mozilla.org/en-US/docs/Web/API/Storage/key) API

[Storage.length](https://developer.mozilla.org/en-US/docs/Web/API/Storage/length)、[Storage.clear()](https://developer.mozilla.org/en-US/docs/Web/API/Storage/clear) 和 [Storage.key()](https://developer.mozilla.org/en-US/docs/Web/API/Storage/key) API 针对的都是 [Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) 里的全量数据，即使这个数据没有通过 useStorage 存储，所以不适合放在 useStorage 中进行封装。

## localStorage or sessionStorage

把 useStorage 设置的更加底层，这样我们就可以基于它来实现 useLocalStorage 或 useSessionStorage，因为 localStorage 和 sessionStorage 的 API 都是相同的，我们只需要给 useStorage 添加一个可选参数来分别它们两个就行了。

比如 useStorage 添加第三个参数：

```js
export function useStorage(keyName, keyValue, { storage = globalThis.localStorage }) {}
```

## 更多优化

掌握思路和核心思想比较重要，只要愿意你可以让 useStorage 更加灵活，比如：

- 存储的值 keyValue 是个 ref 对象，需要 resolveUnref。
- 毕竟 JSON.stringify 是不完美的，需要自定义序列化。
- 当 update 调用的时候禁止 watch 更新。
- 等等

更多参考：[VueUse useStorage](https://github.com/vueuse/vueuse/blob/main/packages/core/useStorage/index.ts)。
