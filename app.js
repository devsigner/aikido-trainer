(function(scope){
'use strict';

/* @__NO_SIDE_EFFECTS__ */
function F2(fun) {
  var wrapper = function(a) { return function(b) { return fun(a,b); }; };
  wrapper.a2 = fun;
  return wrapper;
}
/* @__NO_SIDE_EFFECTS__ */
function F3(fun) {
  var wrapper = function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  };
  wrapper.a3 = fun;
  return wrapper;
}
/* @__NO_SIDE_EFFECTS__ */
function F4(fun) {
  var wrapper = function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  };
  wrapper.a4 = fun;
  return wrapper;
}
/* @__NO_SIDE_EFFECTS__ */
function F5(fun) {
  var wrapper = function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  };
  wrapper.a5 = fun;
  return wrapper;
}
/* @__NO_SIDE_EFFECTS__ */
function F6(fun) {
  var wrapper = function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  };
  wrapper.a6 = fun;
  return wrapper;
}
/* @__NO_SIDE_EFFECTS__ */
function F7(fun) {
  var wrapper = function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  };
  wrapper.a7 = fun;
  return wrapper;
}
/* @__NO_SIDE_EFFECTS__ */
function F8(fun) {
  var wrapper = function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  };
  wrapper.a8 = fun;
  return wrapper;
}
/* @__NO_SIDE_EFFECTS__ */
function F9(fun) {
  var wrapper = function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  };
  wrapper.a9 = fun;
  return wrapper;
}

/* @__NO_SIDE_EFFECTS__ */
function A2(fun, a, b) {
  return fun.a2 ? fun.a2(a, b) : fun(a)(b);
}
/* @__NO_SIDE_EFFECTS__ */
function A3(fun, a, b, c) {
  return fun.a3 ? fun.a3(a, b, c) : fun(a)(b)(c);
}
/* @__NO_SIDE_EFFECTS__ */
function A4(fun, a, b, c, d) {
  return fun.a4 ? fun.a4(a, b, c, d) : fun(a)(b)(c)(d);
}
/* @__NO_SIDE_EFFECTS__ */
function A5(fun, a, b, c, d, e) {
  return fun.a5 ? fun.a5(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
/* @__NO_SIDE_EFFECTS__ */
function A6(fun, a, b, c, d, e, f) {
  return fun.a6 ? fun.a6(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
/* @__NO_SIDE_EFFECTS__ */
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a7 ? fun.a7(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
/* @__NO_SIDE_EFFECTS__ */
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a8 ? fun.a8(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
/* @__NO_SIDE_EFFECTS__ */
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a9 ? fun.a9(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

var $author$project$Root$NavigationMsg = function (a) {
	return { $: 'NavigationMsg', a: a };
};
var $author$project$Navigation$Navigation$UrlChanged = function (a) {
	return { $: 'UrlChanged', a: a };
};
var $author$project$Navigation$Navigation$UrlRequested = function (a) {
	return { $: 'UrlRequested', a: a };
};


/**/
function _Json_errorToString(error)
{
	return $gren_lang$core$Json$Decode$errorToString(error);
}
//*/

// CORE DECODERS

function _Json_succeed(msg) {
  return {
    $: 0,
    a: msg,
  };
}

function _Json_fail(msg) {
  return {
    $: 1,
    a: msg,
  };
}

function _Json_decodePrim(decoder) {
  return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function (value) {
  return typeof value !== "number"
    ? _Json_expecting("an INT", value)
    : Math.trunc(value) === value
      ? $gren_lang$core$Result$Ok(value)
      : isFinite(value) && !(value % 1)
        ? $gren_lang$core$Result$Ok(value)
        : _Json_expecting("an INT", value);
});

var _Json_decodeBool = _Json_decodePrim(function (value) {
  return typeof value === "boolean"
    ? $gren_lang$core$Result$Ok(value)
    : _Json_expecting("a BOOL", value);
});

var _Json_decodeFloat = _Json_decodePrim(function (value) {
  return typeof value === "number"
    ? $gren_lang$core$Result$Ok(value)
    : _Json_expecting("a FLOAT", value);
});

var _Json_decodeValue = _Json_decodePrim(function (value) {
  return $gren_lang$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function (value) {
  return typeof value === "string"
    ? $gren_lang$core$Result$Ok(value)
    : value instanceof String
      ? $gren_lang$core$Result$Ok(value + "")
      : _Json_expecting("a STRING", value);
});

function _Json_decodeArray(decoder) {
  return { $: 3, b: decoder };
}

function _Json_decodeNull(value) {
  return { $: 4, c: value };
}

var _Json_decodeField = F2(function (field, decoder) {
  return {
    $: 5,
    d: field,
    b: decoder,
  };
});

var _Json_decodeIndex = F2(function (index, decoder) {
  return {
    $: 6,
    e: index,
    b: decoder,
  };
});

function _Json_decodeKeyValuePairs(decoder) {
  return {
    $: 7,
    b: decoder,
  };
}

function _Json_mapMany(f, decoders) {
  return {
    $: 8,
    f: f,
    g: decoders,
  };
}

var _Json_andThen = F2(function (callback, decoder) {
  return {
    $: 9,
    b: decoder,
    h: callback,
  };
});

function _Json_oneOf(decoders) {
  return {
    $: 10,
    g: decoders,
  };
}

// DECODING OBJECTS

var _Json_map1 = F2(function (f, d1) {
  return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function (f, d1, d2) {
  return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function (f, d1, d2, d3) {
  return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function (f, d1, d2, d3, d4) {
  return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function (f, d1, d2, d3, d4, d5) {
  return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function (f, d1, d2, d3, d4, d5, d6) {
  return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function (f, d1, d2, d3, d4, d5, d6, d7) {
  return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function (f, d1, d2, d3, d4, d5, d6, d7, d8) {
  return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});

// DECODE

var _Json_runOnString = F2(function (decoder, string) {
  try {
    var value = JSON.parse(string);
    return _Json_runHelp(decoder, value);
  } catch (e) {
    return $gren_lang$core$Result$Err(
      $gren_lang$core$Json$Decode$Failure({
        message: "This is not valid JSON! " + e.message,
        value: _Json_wrap(string),
      }),
    );
  }
});

var _Json_run = F2(function (decoder, value) {
  return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value) {
  switch (decoder.$) {
    case 2:
      return decoder.b(value);

    case 4:
      return value === null
        ? $gren_lang$core$Result$Ok(decoder.c)
        : _Json_expecting("null", value);

    case 3:
      if (!_Json_isArray(value)) {
        return _Json_expecting("an ARRAY", value);
      }
      return _Json_runArrayDecoder(decoder.b, value);

    case 5:
      var field = decoder.d;
      if (typeof value !== "object" || value === null || !(field in value)) {
        return _Json_expecting(
          "an OBJECT with a field named `" + field + "`",
          value,
        );
      }
      var result = _Json_runHelp(decoder.b, value[field]);
      return $gren_lang$core$Result$isOk(result)
        ? result
        : $gren_lang$core$Result$Err($gren_lang$core$Json$Decode$Field({ name: field, error: result.a }));

    case 6:
      var index = decoder.e;
      if (!_Json_isArray(value)) {
        return _Json_expecting("an ARRAY", value);
      }
      if (index >= value.length) {
        return _Json_expecting(
          "a LONGER array. Need index " +
            index +
            " but only see " +
            value.length +
            " entries",
          value,
        );
      }
      var result = _Json_runHelp(decoder.b, value[index]);
      return $gren_lang$core$Result$isOk(result)
        ? result
        : $gren_lang$core$Result$Err($gren_lang$core$Json$Decode$Index({ index: index, error: result.a }));

    case 7:
      if (typeof value !== "object" || value === null || _Json_isArray(value)) {
        return _Json_expecting("an OBJECT", value);
      }

      var keyValuePairs = [];
      for (var key in value) {
        if (Object.hasOwn(value, key)) {
          var result = _Json_runHelp(decoder.b, value[key]);
          if (!$gren_lang$core$Result$isOk(result)) {
            return $gren_lang$core$Result$Err(
              $gren_lang$core$Json$Decode$Field({ name: key, error: result.a }),
            );
          }
          keyValuePairs.push({ key: key, value: result.a });
        }
      }
      return $gren_lang$core$Result$Ok(keyValuePairs);

    case 8:
      var answer = decoder.f;
      var decoders = decoder.g;
      for (var i = 0; i < decoders.length; i++) {
        var result = _Json_runHelp(decoders[i], value);
        if (!$gren_lang$core$Result$isOk(result)) {
          return result;
        }
        answer = answer(result.a);
      }
      return $gren_lang$core$Result$Ok(answer);

    case 9:
      var result = _Json_runHelp(decoder.b, value);
      return !$gren_lang$core$Result$isOk(result)
        ? result
        : _Json_runHelp(decoder.h(result.a), value);

    case 10:
      var errors = [];

      var decoders = decoder.g;
      for (var idx = 0; idx < decoders.length; idx++) {
        var result = _Json_runHelp(decoders[idx], value);
        if ($gren_lang$core$Result$isOk(result)) {
          return result;
        }
        errors.push(result.a);
      }

      return $gren_lang$core$Result$Err($gren_lang$core$Json$Decode$OneOf(errors));

    case 1:
      return $gren_lang$core$Result$Err(
        $gren_lang$core$Json$Decode$Failure({
          message: decoder.a,
          value: _Json_wrap(value),
        }),
      );

    case 0:
      return $gren_lang$core$Result$Ok(decoder.a);
  }
}

function _Json_runArrayDecoder(decoder, value) {
  var len = value.length;
  var array = new Array(len);
  for (var i = 0; i < len; i++) {
    var result = _Json_runHelp(decoder, value[i]);
    if (!$gren_lang$core$Result$isOk(result)) {
      return $gren_lang$core$Result$Err($gren_lang$core$Json$Decode$Index({ index: i, error: result.a }));
    }
    array[i] = result.a;
  }
  return $gren_lang$core$Result$Ok(array);
}

function _Json_isArray(value) {
  return (
    Array.isArray(value) ||
    (typeof FileList !== "undefined" && value instanceof FileList)
  );
}

function _Json_expecting(type, value) {
  return $gren_lang$core$Result$Err(
    $gren_lang$core$Json$Decode$Failure({
      message: "Expecting " + type,
      value: _Json_wrap(value),
    }),
  );
}

// EQUALITY

function _Json_equality(x, y) {
  if (x === y) {
    return true;
  }

  if (x.$ !== y.$) {
    return false;
  }

  switch (x.$) {
    case 0:
    case 1:
      return x.a === y.a;

    case 2:
      return x.b === y.b;

    case 4:
      return x.c === y.c;

    case 3:
    case 7:
      return _Json_equality(x.b, y.b);

    case 5:
      return (
        x.d === y.d && _Json_equality(x.b, y.b)
      );

    case 6:
      return (
        x.e === y.e && _Json_equality(x.b, y.b)
      );

    case 8:
      return (
        x.f === y.f && _Json_arrayEquality(x.g, y.g)
      );

    case 9:
      return (
        x.h === y.h &&
        _Json_equality(x.b, y.b)
      );

    case 10:
      return _Json_arrayEquality(x.g, y.g);
  }
}

function _Json_arrayEquality(aDecoders, bDecoders) {
  var len = aDecoders.length;
  if (len !== bDecoders.length) {
    return false;
  }
  for (var i = 0; i < len; i++) {
    if (!_Json_equality(aDecoders[i], bDecoders[i])) {
      return false;
    }
  }
  return true;
}

// ENCODE

var _Json_encode = F2(function (indentLevel, value) {
  return (
    (indentLevel === 0
      ? JSON.stringify(_Json_unwrap(value))
      : JSON.stringify(_Json_unwrap(value), null, indentLevel)) + ""
  );
});

function _Json_wrap(value) {
  return { $: 0, a: value };
}
function _Json_unwrap(value) {
  return value.a;
}

function _Json_wrap_UNUSED(value) {
  return value;
}
function _Json_unwrap_UNUSED(value) {
  return value;
}

function _Json_emptyArray() {
  return [];
}
function _Json_emptyObject() {
  return {};
}

var _Json_addField = F3(function (key, value, object) {
  var unwrapped = _Json_unwrap(value);
  if (!(key === "toJSON" && typeof unwrapped === "function")) {
    object[key] = unwrapped;
  }
  return object;
});

function _Json_addEntry(func) {
  return F2(function (entry, array) {
    array.push(_Json_unwrap(func(entry)));
    return array;
  });
}

var _Json_encodeNull = _Json_wrap(null);
var $gren_lang$core$Result$Err = function (a) {
	return { $: 'Err', a: a };
};
var $gren_lang$core$Json$Decode$Failure = function (a) {
	return { $: 'Failure', a: a };
};
var $gren_lang$core$Json$Decode$Field = function (a) {
	return { $: 'Field', a: a };
};
var $gren_lang$core$Json$Decode$Index = function (a) {
	return { $: 'Index', a: a };
};
var $gren_lang$core$Result$Ok = function (a) {
	return { $: 'Ok', a: a };
};
var $gren_lang$core$Json$Decode$OneOf = function (a) {
	return { $: 'OneOf', a: a };
};


var _Array_length = function (array) {
  return array.length;
};

var _Array_initialize = F3(function (size, offset, func) {
  if (size < 0) {
    return [];
  }

  var result = new Array(size);

  for (var i = 0; i < size; i++) {
    result[i] = func(offset + i);
  }

  return result;
});

var _Array_get = F2(function (index, array) {
  var value = array.at(index);

  if (typeof value === "undefined") {
    return $gren_lang$core$Maybe$Nothing;
  }

  return $gren_lang$core$Maybe$Just(value);
});

var _Array_set = F3(function (index, value, array) {
  try {
    return array.with(index, value);
  } catch (e) {
    // assuming RangeError
    return array;
  }
});

var _Array_splice0 = F3(function (index, toRemove, array) {
  return array.toSpliced(index, toRemove);
});

var _Array_splice1 = F4(function (index, toRemove, toAdd, array) {
  return array.toSpliced(index, toRemove, toAdd);
});

var _Array_spliceN = F4(function (index, toRemove, toAdd, array) {
  return array.toSpliced(index, toRemove, ...toAdd);
});

var _Array_foldl = F3(function (func, acc, array) {
  for (var i = 0; i < array.length; i++) {
    acc = A2(func, array[i], acc);
  }

  return acc;
});

var _Array_foldr = F3(function (func, acc, array) {
  for (var i = array.length - 1; i >= 0; i--) {
    acc = A2(func, array[i], acc);
  }

  return acc;
});

var _Array_indexedFoldl = F3(function (func, acc, array) {
  for (var i = 0; i < array.length; i++) {
    acc = A3(func, i, array[i], acc);
  }

  return acc;
});

var _Array_indexedFoldr = F3(function (func, acc, array) {
  for (var i = array.length - 1; i >= 0; i--) {
    acc = A3(func, i, array[i], acc);
  }

  return acc;
});

var _Array_map = F2(function (func, array) {
  return array.map(func);
});

var _Array_indexedMap = F2(function (func, array) {
  return array.map(function (value, index) {
    return A2(func, index, value);
  });
});

var _Array_filter = F2(function (func, array) {
  return array.filter(func);
});

var _Array_indexedFilter = F2(function (func, array) {
  return array.filter(function (value, index) {
    return A2(func, index, value);
  });
});

var _Array_flat = function (array) {
  return array.flat();
};

var _Array_flatMap = F2(function (func, array) {
  return array.flatMap(func);
});

var _Array_slice = F3(function (from, to, array) {
  return array.slice(from, to);
});

var _Array_append = F2(function (left, right) {
  return left.concat(right);
});

var _Array_reverse = function (array) {
  return array.toReversed();
};

var _Array_findFirst = F2(function (pred, array) {
  for (var i = 0; i < array.length; i++) {
    var element = array[i];

    if (pred(element)) {
      return $gren_lang$core$Maybe$Just({ index: i, value: element });
    }
  }

  return $gren_lang$core$Maybe$Nothing;
});

var _Array_findLast = F2(function (pred, array) {
  for (var i = array.length - 1; i >= 0; i--) {
    var element = array[i];

    if (pred(element)) {
      return $gren_lang$core$Maybe$Just({ index: i, value: element });
    }
  }

  return $gren_lang$core$Maybe$Nothing;
});

var _Array_map2 = F3(function (fn, as, bs) {
  var result = [];
  var lowestLength = as.length < bs.length ? as.length : bs.length;

  for (var i = 0; i < lowestLength; i++) {
    result.push(A2(fn, as[i], bs[i]));
  }

  return result;
});

var _Array_map3 = F4(function (fn, as, bs, cs) {
  var result = [];
  var lowestLength = [as.length, bs.length, cs.length].sort()[0];

  for (var i = 0; i < lowestLength; i++) {
    result.push(A3(fn, as[i], bs[i], cs[i]));
  }

  return result;
});

var _Array_sort = function (array) {
  return array.toSorted(function (a, b) {
    return _Utils_cmp(a, b);
  });
};

var _Array_sortBy = F2(function (fn, array) {
  return array.toSorted(function (a, b) {
    return _Utils_cmp(fn(a), fn(b));
  });
});

var _Array_sortWith = F2(function (fn, array) {
  return array.toSorted(function (a, b) {
    var ord = A2(fn, a, b);
    return ord === $gren_lang$core$Basics$EQ ? 0 : ord === $gren_lang$core$Basics$LT ? -1 : 1;
  });
});

class _Array_Builder {
  constructor(target, finalized, array) {
    this.target = target;
    this.finalized = finalized;
    this.array = array;
  }
}

var _Array_emptyBuilder = function (capacity) {
  return new _Array_Builder(0, false, new Array(capacity));
};

var _Array_pushToBuilder = F2(function (value, builder) {
  var array = builder.array;
  var target = builder.target;

  if (builder.finalized) {
    array = array.slice(0, target);
  } else {
    builder.finalized = true;
  }

  if (target < array.length) {
    array[target] = value;
  } else {
    array.push(value);
  }

  return new _Array_Builder(target + 1, false, array);
});

var _Array_appendToBuilder = F2(function (array, builder) {
  var newArray = _Array_fromBuilder(builder);

  for (var i = 0; i < array.length; i++) {
    newArray.push(array[i]);
  }

  return new _Array_Builder(newArray.length, false, newArray);
});

var _Array_toBuilder = function (array) {
  return new _Array_Builder(array.length, true, array);
};

var _Array_fromBuilder = function (builder) {
  var result = builder.array;

  if (builder.finalized) {
    result = result.slice(0, builder.target);
  } else {
    builder.finalized = true;
    result.length = builder.target;
  }

  return result;
};


// EQUALITY

function _Utils_eq(x, y) {
  for (
    var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
    isEqual && (pair = stack.pop());
    isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
  ) {}

  return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack) {
  if (x === y) {
    return true;
  }

  if (typeof x !== "object" || x === null || y === null) {
    typeof x === "function" && _Debug_crash(5);
    return false;
  }

  if (depth > 100) {
    stack.push({ a: x, b: y });
    return true;
  }

  /**/
	if (x.$ === 'Set_gren_builtin')
	{
		x = $gren_lang$core$Set$toArray(x);
		y = $gren_lang$core$Set$toArray(y);
	}
	if (x.$ === 'RBNode_gren_builtin' || x.$ === 'RBEmpty_gren_builtin')
	{
		x = A3($gren_lang$core$Dict$foldl, F3(function(key, value, acc) { acc.push({ a: key, b: value }); return acc; }), [], x);
		y = A3($gren_lang$core$Dict$foldl, F3(function(key, value, acc) { acc.push({ a: key, b: value }); return acc; }), [], y);
	}
	//*/

  /**_UNUSED/
	if (x.$ < 0)
	{
		x = A3($gren_lang$core$Dict$foldl, F3(function(key, value, acc) { acc.push({ a: key, b: value }); return acc; }), [], x);
		y = A3($gren_lang$core$Dict$foldl, F3(function(key, value, acc) { acc.push({ a: key, b: value }); return acc; }), [], y);
	}
	//*/

  if (x instanceof DataView) {
    var length = x.byteLength;

    if (y.byteLength !== length) {
      return false;
    }

    for (var i = 0; i < length; ++i) {
      if (x.getUint8(i) !== y.getUint8(i)) {
        return false;
      }
    }

    return true;
  }

  if (x instanceof _Array_Builder) {
    x = _Array_fromBuilder(x);
    y = _Array_fromBuilder(y);
  }

  if (Array.isArray(x) && x.length !== y.length) {
    return false;
  }

  var nextDepth = depth + 1;

  for (var key in x) {
    if (!_Utils_eqHelp(x[key], y[key], nextDepth, stack)) {
      return false;
    }
  }

  return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function (a, b) {
  return !_Utils_eq(a, b);
});

// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y) {
  if (typeof x !== "object") {
    return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
  }

  /**/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

  // At this point, we can only be comparing arrays
  for (var idx = 0; idx < x.length; idx++) {
    var ord = _Utils_cmp(x[idx], y[idx]);
    if (ord !== 0) return ord;
  }

  return x.length - y.length;
}

var _Utils_lt = F2(function (a, b) {
  return _Utils_cmp(a, b) < 0;
});
var _Utils_le = F2(function (a, b) {
  return _Utils_cmp(a, b) < 1;
});
var _Utils_gt = F2(function (a, b) {
  return _Utils_cmp(a, b) > 0;
});
var _Utils_ge = F2(function (a, b) {
  return _Utils_cmp(a, b) >= 0;
});

var _Utils_compare = F2(function (x, y) {
  var n = _Utils_cmp(x, y);
  return n < 0 ? $gren_lang$core$Basics$LT : n ? $gren_lang$core$Basics$GT : $gren_lang$core$Basics$EQ;
});

// COMMON VALUES

function _Utils_chr_UNUSED(c) {
  return c;
}
function _Utils_chr(c) {
  return new String(c);
}

// RECORDS

function _Utils_update(oldRecord, updatedFields) {
  var newRecord = {};

  for (var key in oldRecord) {
    newRecord[key] = oldRecord[key];
  }

  for (var key in updatedFields) {
    newRecord[key] = updatedFields[key];
  }

  return newRecord;
}

// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys) {
  // append Strings
  if (typeof xs === "string") {
    return xs + ys;
  }

  return xs.concat(ys);
}


// LOG

var _Debug_log_UNUSED = F2(function (tag, value) {
  return value;
});

var _Debug_log = F2(function (tag, value) {
  console.log(tag + ": " + _Debug_toString(value));
  return value;
});

// TODOS

function _Debug_todo(moduleName, region) {
  return function (message) {
    _Debug_crash(8, moduleName, region, message);
  };
}

function _Debug_todoCase(moduleName, region, value) {
  return function (message) {
    _Debug_crash(9, moduleName, region, value, message);
  };
}

// TO STRING

function _Debug_toString_UNUSED(value) {
  return "<internals>";
}

function _Debug_toString(value) {
  return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value) {
  if (value == null) {
    return _Debug_internalColor(ansi, "<null>");
  }

  if (typeof value === "function") {
    return _Debug_internalColor(ansi, "<function>");
  }

  if (typeof value === "boolean") {
    return _Debug_ctorColor(ansi, value ? "True" : "False");
  }

  if (typeof value === "number") {
    return _Debug_numberColor(ansi, value + "");
  }

  if (value instanceof String) {
    return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
  }

  if (typeof value === "string") {
    return _Debug_stringColor(
      ansi,
      '"' + _Debug_addSlashes(value, false) + '"',
    );
  }

  if (Array.isArray(value)) {
    var output = "[";

    value.length > 0 && (output += _Debug_toAnsiString(ansi, value[0]));

    for (var idx = 1; idx < value.length; idx++) {
      output += ", " + _Debug_toAnsiString(ansi, value[idx]);
    }

    return output + "]";
  }

  if (typeof value === "object" && "$" in value) {
    var tag = value.$;

    if (typeof tag === "number") {
      return _Debug_internalColor(ansi, "<internals>");
    }

    if (tag === "Set_gren_builtin") {
      return (
        _Debug_ctorColor(ansi, "Set") +
        _Debug_fadeColor(ansi, ".fromArray") +
        " " +
        _Debug_toAnsiString(ansi, $gren_lang$core$Set$toArray(value))
      );
    }

    if (tag === "RBNode_gren_builtin" || tag === "RBEmpty_gren_builtin") {
      return (
        _Debug_ctorColor(ansi, "Dict") +
        _Debug_fadeColor(ansi, ".fromArray") +
        " " +
        _Debug_toAnsiString(
          ansi,
          A3(
            $gren_lang$core$Dict$foldl,
            F3(function (key, value, acc) {
              acc.push({ key: key, value: value });
              return acc;
            }),
            [],
            value,
          ),
        )
      );
    }

    var output = "";
    for (var i in value) {
      if (i === "$") continue;
      var str = _Debug_toAnsiString(ansi, value[i]);
      var c0 = str[0];
      var parenless =
        c0 === "{" ||
        c0 === "(" ||
        c0 === "[" ||
        c0 === "<" ||
        c0 === '"' ||
        str.indexOf(" ") < 0;
      output += " " + (parenless ? str : "(" + str + ")");
    }
    return _Debug_ctorColor(ansi, tag) + output;
  }

  if (value instanceof DataView) {
    return _Debug_stringColor(ansi, "<" + value.byteLength + " bytes>");
  }

  if (typeof File !== "undefined" && value instanceof File) {
    return _Debug_internalColor(ansi, "<" + value.name + ">");
  }

  if (
    typeof _Array_Builder !== "undefined" &&
    value instanceof _Array_Builder
  ) {
    return _Debug_toAnsiString(ansi, value.array.slice(0, value.target));
  }

  if (typeof value === "object") {
    var output = [];
    for (var key in value) {
      var field = key[0] === "_" ? key.slice(1) : key;
      output.push(
        _Debug_fadeColor(ansi, field) +
          " = " +
          _Debug_toAnsiString(ansi, value[key]),
      );
    }
    if (output.length === 0) {
      return "{}";
    }
    return "{ " + output.join(", ") + " }";
  }

  return _Debug_internalColor(ansi, "<internals>");
}

function _Debug_addSlashes(str, isChar) {
  var s = str
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")
    .replace(/\r/g, "\\r")
    .replace(/\v/g, "\\v")
    .replace(/\0/g, "\\0");

  if (isChar) {
    return s.replace(/\'/g, "\\'");
  } else {
    return s.replace(/\"/g, '\\"');
  }
}

function _Debug_ctorColor(ansi, string) {
  return ansi ? "\x1b[96m" + string + "\x1b[0m" : string;
}

function _Debug_numberColor(ansi, string) {
  return ansi ? "\x1b[95m" + string + "\x1b[0m" : string;
}

function _Debug_stringColor(ansi, string) {
  return ansi ? "\x1b[93m" + string + "\x1b[0m" : string;
}

function _Debug_charColor(ansi, string) {
  return ansi ? "\x1b[92m" + string + "\x1b[0m" : string;
}

function _Debug_fadeColor(ansi, string) {
  return ansi ? "\x1b[37m" + string + "\x1b[0m" : string;
}

function _Debug_internalColor(ansi, string) {
  return ansi ? "\x1b[36m" + string + "\x1b[0m" : string;
}

function _Debug_toHexDigit(n) {
  return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}

// CRASH

function _Debug_crash_UNUSED(identifier) {
  throw new Error(
    "https://github.com/gren-lang/core/blob/1.0.0/hints/" + identifier + ".md",
  );
}

function _Debug_crash(identifier, fact1, fact2, fact3, fact4) {
  switch (identifier) {
    case 0:
      throw new Error(
        'What node should I take over? In JavaScript I need something like:\n\n    Gren.Main.init({\n        node: document.getElementById("gren-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.',
      );

    case 1:
      throw new Error(
        "Browser.application programs cannot handle URLs like this:\n\n    " +
          document.location.href +
          "\n\nWhat is the root? The root of your file system?",
      );

    case 2:
      var jsonErrorString = fact1;
      throw new Error(
        "Problem with the flags given to your Gren program on initialization.\n\n" +
          jsonErrorString,
      );

    case 3:
      var portName = fact1;
      throw new Error(
        "There can only be one port named `" +
          portName +
          "`, but your program has multiple.",
      );

    case 4:
      var portName = fact1;
      var problem = fact2;
      throw new Error(
        "Trying to send an unexpected type of value through port `" +
          portName +
          "`:\n" +
          problem,
      );

    case 5:
      throw new Error(
        'Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Gren sense.\nRead more about this at https://package.gren-lang.org/packages/gren-lang/core/latest/Basics#== which describes why it is this way and what the better version will look like.',
      );

    case 6:
      var moduleName = fact1;
      throw new Error(
        "Your page is loading multiple Gren scripts with a module named " +
          moduleName +
          ". Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!",
      );

    case 8:
      var moduleName = fact1;
      var region = fact2;
      var message = fact3;
      throw new Error(
        "TODO in module `" +
          moduleName +
          "` " +
          _Debug_regionToString(region) +
          "\n\n" +
          message,
      );

    case 9:
      var moduleName = fact1;
      var region = fact2;
      var value = fact3;
      var message = fact4;
      throw new Error(
        "TODO in module `" +
          moduleName +
          "` from the `case` expression " +
          _Debug_regionToString(region) +
          "\n\nIt received the following value:\n\n    " +
          _Debug_toString(value).replace("\n", "\n    ") +
          "\n\nBut the branch that handles it says:\n\n    " +
          message.replace("\n", "\n    "),
      );

    case 10:
      throw new Error("Bug in https://github.com/gren-lang/core/issues");

    case 11:
      throw new Error("Cannot perform mod 0. Division by zero error.");
  }
}

function _Debug_regionToString(region) {
  if (region.start.line === region.end.line) {
    return "on line " + region.start.line;
  }
  return (
    "on lines " + region.start.line + " through " + region.end.line
  );
}
var $gren_lang$core$Dict$foldl$ = function(func, acc, dict) {
	foldl:
	while (true) {
		if (dict.$ === 'RBEmpty_gren_builtin') {
			return acc;
		} else {
			var _v1 = dict.a;
			var key = _v1.key;
			var value = _v1.value;
			var left = _v1.left;
			var right = _v1.right;
			var $temp$func = func,
			$temp$acc = A3(func, key, value, $gren_lang$core$Dict$foldl$(func, acc, left)),
			$temp$dict = right;
			func = $temp$func;
			acc = $temp$acc;
			dict = $temp$dict;
			continue foldl;
		}
	}
};
var $gren_lang$core$Dict$foldl = F3($gren_lang$core$Dict$foldl$);
var $gren_lang$core$Array$length = _Array_length;
var $gren_lang$core$Array$pushLast$ = function(value, array) {
	return A4(_Array_splice1, $gren_lang$core$Array$length(array), 0, value, array);
};
var $gren_lang$core$Array$pushLast = F2($gren_lang$core$Array$pushLast$);
var $gren_lang$core$Dict$keys = function(dict) {
	return $gren_lang$core$Dict$foldl$(F3(function(key, value, keyArray) {
				return $gren_lang$core$Array$pushLast$(key, keyArray);
			}), [  ], dict);
};
var $gren_lang$core$Set$toArray = function(_v0) {
	var dict = _v0.a;
	return $gren_lang$core$Dict$keys(dict);
};
var $gren_lang$core$Basics$EQ = { $: 'EQ' };
var $gren_lang$core$Basics$GT = { $: 'GT' };
var $gren_lang$core$Basics$LT = { $: 'LT' };
var $gren_lang$core$Maybe$Just = function (a) {
	return { $: 'Just', a: a };
};
var $gren_lang$core$Maybe$Nothing = { $: 'Nothing' };
var $gren_lang$core$Basics$False = { $: 'False' };


// MATH

var _Basics_add = F2(function (a, b) {
  return a + b;
});
var _Basics_sub = F2(function (a, b) {
  return a - b;
});
var _Basics_mul = F2(function (a, b) {
  return a * b;
});
var _Basics_fdiv = F2(function (a, b) {
  return a / b;
});
var _Basics_idiv = F2(function (a, b) {
  return Math.trunc(a / b);
});
var _Basics_pow = F2(Math.pow);

// MORE MATH

function _Basics_toFloat(x) {
  return x;
}
function _Basics_isInfinite(n) {
  return n === Infinity || n === -Infinity;
}

var _Basics_isNaN = isNaN;

// BOOLEANS

function _Basics_not(bool) {
  return !bool;
}
var _Basics_and = F2(function (a, b) {
  return a && b;
});
var _Basics_or = F2(function (a, b) {
  return a || b;
});
var _Basics_xor = F2(function (a, b) {
  return a !== b;
});
var $gren_lang$core$Basics$add = _Basics_add;


var _String_pushFirst = F2(function (char, string) {
  return char + string;
});

var _String_pushLast = F2(function (char, string) {
  return string + char;
});

var _String_popFirst = function (string) {
  if (string.length <= 0) {
    return $gren_lang$core$Maybe$Nothing;
  }

  var firstPointNumber = string.codePointAt(0);
  var firstChar = String.fromCodePoint(firstPointNumber);

  return $gren_lang$core$Maybe$Just({
    first: _Utils_chr(firstChar),
    rest: string.slice(firstChar.length),
  });
};

var _String_popLast = function (string) {
  var strLen = string.length;

  if (strLen === 0) {
    return $gren_lang$core$Maybe$Nothing;
  } else if (strLen === 1) {
    return $gren_lang$core$Maybe$Just({
      last: _Utils_chr(string),
      rest: "",
    });
  }

  var secondLastIdx = strLen - 2;
  var possiblyLastPoint = string.codePointAt(secondLastIdx);

  if (possiblyLastPoint > 0xffff) {
    // last character is two units
    return $gren_lang$core$Maybe$Just({
      last: _Utils_chr(String.fromCodePoint(possiblyLastPoint)),
      rest: string.slice(0, strLen - 2),
    });
  }

  return $gren_lang$core$Maybe$Just({
    last: _Utils_chr(string[strLen - 1]),
    rest: string.slice(0, strLen - 1),
  });
};

var _String_append = F2(function (a, b) {
  return a + b;
});

var _String_repeat = F2(function (num, chunk) {
  try {
    return chunk.repeat(num);
  } catch (error) {
    if (error.name === "RangeError") {
      return "";
    } else {
      throw error;
    }
  }
});

var _String_foldl = F3(function (func, state, string) {
  for (let char of string) {
    state = A2(func, _Utils_chr(char), state);
  }

  return state;
});

var _String_foldr = F3(function (func, state, string) {
  let reversed = [];

  for (let char of string) {
    reversed.unshift(char);
  }

  for (let char of reversed) {
    state = A2(func, _Utils_chr(char), state);
  }

  return state;
});

var _String_split = F2(function (sep, str) {
  return sep === "" ? Array.from(str) : str.split(sep);
});

var _String_join = F2(function (sep, strs) {
  return strs.join(sep);
});

var _String_slice = F3(function (start, end, str) {
  return Array.from(str).slice(start, end).join("");
});

function _String_trim(str) {
  return str.trim();
}

function _String_trimLeft(str) {
  return str.replace(/^\s+/, "");
}

function _String_trimRight(str) {
  return str.replace(/\s+$/, "");
}

function _String_words(str) {
  return str.trim().split(/\s+/g);
}

function _String_lines(str) {
  return str.split(/\r\n|\r|\n/g);
}

function _String_toUpper(str) {
  return str.toUpperCase();
}

function _String_toLower(str) {
  return str.toLowerCase();
}

var _String_any = F2(function (isGood, string) {
  for (let char of string) {
    if (isGood(_Utils_chr(char))) {
      return true;
    }
  }

  return false;
});

var _String_contains = F2(function (sub, str) {
  return str.indexOf(sub) > -1;
});

var _String_startsWith = F3(function (offset, sub, str) {
  return str.startsWith(sub, offset);
});

var _String_endsWith = F2(function (sub, str) {
  return (
    str.length >= sub.length && str.lastIndexOf(sub) === str.length - sub.length
  );
});

var _String_indexOf = F3(function (offset, sub, str) {
  let unitIdx = 0;
  let pointIdx = 0;

  for (const char of str) {
    if (pointIdx >= offset && str.startsWith(sub, unitIdx)) {
      return $gren_lang$core$Maybe$Just(pointIdx);
    }

    unitIdx += char.length;
    pointIdx += 1;
  }

  return $gren_lang$core$Maybe$Nothing;
});

var _String_unitIndexOf = F3(function (offset, sub, str) {
  var ret = str.indexOf(sub, offset);

  if (ret > -1) {
    return $gren_lang$core$Maybe$Just(ret);
  }

  return $gren_lang$core$Maybe$Nothing;
});

var _String_unitLastIndexOf = F2(function (sub, str) {
  var ret = str.lastIndexOf(sub);

  if (ret > -1) {
    return $gren_lang$core$Maybe$Just(ret);
  }

  return $gren_lang$core$Maybe$Nothing;
});

var _String_indexes = F2(function (sub, str) {
  if (sub.length === 0) {
    return [];
  }

  let subPoints = 0;
  for (let _ of sub) {
    subPoints++;
  }

  let unitIdx = 0;
  let pointIdx = 0;
  let skipPoints = 0;
  let result = [];

  for (let char of str) {
    if (skipPoints === 0 && str.startsWith(sub, unitIdx)) {
      skipPoints += subPoints;
      result.push(pointIdx);
    }

    unitIdx += char.length;
    pointIdx += 1;

    if (skipPoints > 0) {
      skipPoints--;
    }
  }

  return result;
});

var _String_unitIndices = F2(function (sub, str) {
  var subLen = sub.length;

  if (subLen < 1) {
    return [];
  }

  var i = 0;
  var is = [];

  while ((i = str.indexOf(sub, i)) > -1) {
    is.push(i);
    i = i + subLen;
  }

  return is;
});

// TO STRING

function _String_fromNumber(number) {
  return number + "";
}

// INT CONVERSIONS

function _String_toInt(str) {
  var total = 0;
  var code0 = str.charCodeAt(0);
  var start = code0 == 0x2b /* + */ || code0 == 0x2d /* - */ ? 1 : 0;

  for (var i = start; i < str.length; ++i) {
    var code = str.charCodeAt(i);
    if (code < 0x30 || 0x39 < code) {
      return $gren_lang$core$Maybe$Nothing;
    }
    total = 10 * total + (code - 0x30);
  }

  return i == start
    ? $gren_lang$core$Maybe$Nothing
    : $gren_lang$core$Maybe$Just(code0 == 0x2d ? -total : total);
}

// FLOAT CONVERSIONS

function _String_toFloat(s) {
  // check if it is a hex, octal, or binary number
  if (s.length === 0 || /[\sxbo]/.test(s)) {
    return $gren_lang$core$Maybe$Nothing;
  }
  var n = +s;
  // faster isNaN check
  return n === n ? $gren_lang$core$Maybe$Just(n) : $gren_lang$core$Maybe$Nothing;
}

function _String_fromArray(chars) {
  return chars.join("");
}

// UNITS

var _String_unitLength = function (str) {
  return str.length;
};

var _String_getUnit = F2(function (index, str) {
  var char = str.at(index);

  if (typeof char === "undefined") {
    return $gren_lang$core$Maybe$Nothing;
  }

  return $gren_lang$core$Maybe$Just(_Utils_chr(char));
});

var _String_foldlUnits = F3(function (fn, state, str) {
  for (let i = 0; i < str.length; i++) {
    state = A2(fn, _Utils_chr(str[i]), state);
  }

  return state;
});

var _String_foldrUnits = F3(function (fn, state, str) {
  for (let i = str.length - 1; i >= 0; i--) {
    state = A2(fn, _Utils_chr(str[i]), state);
  }

  return state;
});

var _String_sliceUnits = F3(function (start, end, str) {
  return str.slice(start, end);
});
var $gren_lang$core$String$any = _String_any;
var $gren_lang$core$Basics$composeL$ = function(g, f) {
	return function(x) {
		return g(f(x));
	};
};
var $gren_lang$core$Basics$composeL = F2($gren_lang$core$Basics$composeL$);
var $gren_lang$core$Basics$not = _Basics_not;
var $gren_lang$core$String$all$ = function(isGood, str) {
	return !A2($gren_lang$core$String$any, $gren_lang$core$Basics$composeL$($gren_lang$core$Basics$not, isGood), str);
};
var $gren_lang$core$String$all = F2($gren_lang$core$String$all$);
var $gren_lang$core$Basics$and = _Basics_and;
var $gren_lang$core$Basics$append = _Utils_append;
var $gren_lang$core$Json$Encode$encode = _Json_encode;
var $gren_lang$core$String$fromInt = _String_fromNumber;
var $gren_lang$core$String$join = _String_join;
var $gren_lang$core$String$split = _String_split;
var $gren_lang$core$Json$Decode$indent = function(str) {
	return A2($gren_lang$core$String$join, '\n    ', A2($gren_lang$core$String$split, '\n', str));
};
var $gren_lang$core$Array$indexedMap = _Array_indexedMap;
var $gren_lang$core$Basics$le = _Utils_le;


function _Char_toCode(char) {
  return char.codePointAt(0);
}

function _Char_fromCode(code) {
  try {
    return _Utils_chr(String.fromCodePoint(code));
  } catch (e) {
    return $gren_lang$core$Char$replacementChar;
  }
}
var $gren_lang$core$Char$replacementChar = _Utils_chr('\uFFFD');
var $gren_lang$core$Char$toCode = _Char_toCode;
var $gren_lang$core$Char$isLower = function(_char) {
	var code = $gren_lang$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $gren_lang$core$Char$isUpper = function(_char) {
	var code = $gren_lang$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $gren_lang$core$Basics$or = _Basics_or;
var $gren_lang$core$Char$isAlpha = function(_char) {
	return $gren_lang$core$Char$isLower(_char) || $gren_lang$core$Char$isUpper(_char);
};
var $gren_lang$core$Char$isDigit = function(_char) {
	var code = $gren_lang$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $gren_lang$core$Char$isAlphaNum = function(_char) {
	return $gren_lang$core$Char$isLower(_char) || ($gren_lang$core$Char$isUpper(_char) || $gren_lang$core$Char$isDigit(_char));
};
var $gren_lang$core$String$popFirst = _String_popFirst;
var $gren_lang$core$Json$Decode$errorOneOf$ = function(i, error) {
	return '\n\n(' + ($gren_lang$core$String$fromInt(i + 1) + (') ' + $gren_lang$core$Json$Decode$indent($gren_lang$core$Json$Decode$errorToString(error))));
};
var $gren_lang$core$Json$Decode$errorOneOf = F2($gren_lang$core$Json$Decode$errorOneOf$);
var $gren_lang$core$Json$Decode$errorToString = function(error) {
	return $gren_lang$core$Json$Decode$errorToStringHelp$(error, [  ]);
};
var $gren_lang$core$Json$Decode$errorToStringHelp$ = function(error, context) {
	errorToStringHelp:
	while (true) {
		switch (error.$) {
			case 'Field':
				var _v1 = error.a;
				var f = _v1.name;
				var err = _v1.error;
				var isSimple = function () {
					var _v2 = $gren_lang$core$String$popFirst(f);
					if (_v2.$ === 'Nothing') {
						return false;
					} else {
						var _v3 = _v2.a;
						var _char = _v3.first;
						var rest = _v3.rest;
						return $gren_lang$core$Char$isAlpha(_char) && $gren_lang$core$String$all$($gren_lang$core$Char$isAlphaNum, rest);
					}
				}();
				var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
				var $temp$error = err,
				$temp$context = $gren_lang$core$Array$pushLast$(fieldName, context);
				error = $temp$error;
				context = $temp$context;
				continue errorToStringHelp;
			case 'Index':
				var _v4 = error.a;
				var i = _v4.index;
				var err = _v4.error;
				var indexName = '[' + ($gren_lang$core$String$fromInt(i) + ']');
				var $temp$error = err,
				$temp$context = $gren_lang$core$Array$pushLast$(indexName, context);
				error = $temp$error;
				context = $temp$context;
				continue errorToStringHelp;
			case 'OneOf':
				var errors = error.a;
				switch (errors.length) {
					case 0:
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (context.length === 0) {
								return '!';
							} else {
								return ' at json' + A2($gren_lang$core$String$join, '', context);
							}
						}();
					case 1:
						var err = errors[0];
						var $temp$error = err,
						$temp$context = context;
						error = $temp$error;
						context = $temp$context;
						continue errorToStringHelp;
					default:
						var starter = function () {
							if (context.length === 0) {
								return 'Json.Decode.oneOf';
							} else {
								return 'The Json.Decode.oneOf at json' + A2($gren_lang$core$String$join, '', context);
							}
						}();
						var introduction = starter + (' failed in the following ' + ($gren_lang$core$String$fromInt($gren_lang$core$Array$length(errors)) + ' ways:'));
						return A2($gren_lang$core$String$join, '\n\n', _Utils_ap([ introduction ], A2($gren_lang$core$Array$indexedMap, $gren_lang$core$Json$Decode$errorOneOf, errors)));
				}
			default:
				var _v8 = error.a;
				var msg = _v8.message;
				var json = _v8.value;
				var introduction = function () {
					if (context.length === 0) {
						return 'Problem with the given value:\n\n';
					} else {
						return 'Problem with the value at json' + (A2($gren_lang$core$String$join, '', context) + ':\n\n    ');
					}
				}();
				return introduction + ($gren_lang$core$Json$Decode$indent(A2($gren_lang$core$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
		}
	}
};
var $gren_lang$core$Json$Decode$errorToStringHelp = F2($gren_lang$core$Json$Decode$errorToStringHelp$);
var $gren_lang$core$Basics$True = { $: 'True' };
var $gren_lang$core$Result$isOk = function(result) {
	if (result.$ === 'Ok') {
		return true;
	} else {
		return false;
	}
};
var $gren_lang$core$Json$Decode$andThen = _Json_andThen;


// ELEMENT

var _Browser_element = F3(function (impl, flagDecoder, args) {
  return _Platform_initialize(
    flagDecoder,
    args,
    impl.init,
    impl.update,
    impl.subscriptions,
    function (sendToApp, initialModel) {
      var view = impl.view;
      /**_UNUSED/
			var domNode = args['node'];
			//*/
      /**/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
      var currNode = _VirtualDom_virtualize(domNode);

      return _Browser_makeAnimator(initialModel, function (model) {
        var nextNode = view(model);
        var patches = _VirtualDom_diff(currNode, nextNode);
        domNode = _VirtualDom_applyPatches(
          domNode,
          currNode,
          patches,
          sendToApp,
        );
        currNode = nextNode;
      });
    },
  );
});

// DOCUMENT

var _Browser_document = F3(function (impl, flagDecoder, args) {
  return _Platform_initialize(
    flagDecoder,
    args,
    impl.init,
    impl.update,
    impl.subscriptions,
    function (sendToApp, initialModel) {
      var divertHrefToApp = impl.setup && impl.setup(sendToApp);
      var view = impl.view;
      var title = _VirtualDom_doc.title;
      var bodyNode = _VirtualDom_doc.body;
      var currNode = _VirtualDom_virtualize(bodyNode);
      return _Browser_makeAnimator(initialModel, function (model) {
        _VirtualDom_divertHrefToApp = divertHrefToApp;
        var doc = view(model);
        var nextNode = _VirtualDom_node("body")([])(doc.body);
        var patches = _VirtualDom_diff(currNode, nextNode);
        bodyNode = _VirtualDom_applyPatches(
          bodyNode,
          currNode,
          patches,
          sendToApp,
        );
        currNode = nextNode;
        _VirtualDom_divertHrefToApp = 0;
        title !== doc.title &&
          (_VirtualDom_doc.title = title = doc.title);
      });
    },
  );
});

// ANIMATION

var _Browser_cancelAnimationFrame =
  typeof cancelAnimationFrame !== "undefined"
    ? cancelAnimationFrame
    : function (id) {
        clearTimeout(id);
      };

var _Browser_requestAnimationFrame =
  typeof requestAnimationFrame !== "undefined"
    ? requestAnimationFrame
    : function (callback) {
        return setTimeout(callback, 1000 / 60);
      };

function _Browser_makeAnimator(model, draw) {
  draw(model);

  var state = 0;

  function updateIfNeeded() {
    state =
      state === 1
        ? 0
        : (_Browser_requestAnimationFrame(updateIfNeeded),
          draw(model),
          1);
  }

  return function (nextModel, isSync) {
    model = nextModel;

    isSync
      ? (draw(model),
        state === 2 && (state = 1))
      : (state === 0 &&
          _Browser_requestAnimationFrame(updateIfNeeded),
        (state = 2));
  };
}

// APPLICATION

function _Browser_application(impl) {
  var onUrlChange = impl.onUrlChange;
  var onUrlRequest = impl.onUrlRequest;
  var key = function () {
    key.a(onUrlChange(_Browser_getUrl()));
  };

  return _Browser_document({
    setup: function (sendToApp) {
      key.a = sendToApp;
      _Browser_window.addEventListener("popstate", key);
      _Browser_window.navigator.userAgent.indexOf("Trident") < 0 ||
        _Browser_window.addEventListener("hashchange", key);

      return F2(function (domNode, event) {
        if (
          !event.ctrlKey &&
          !event.metaKey &&
          !event.shiftKey &&
          event.button < 1 &&
          !domNode.target &&
          !domNode.hasAttribute("download")
        ) {
          event.preventDefault();
          var href = domNode.href;
          var curr = _Browser_getUrl();
          var next = $gren_lang$url$Url$fromString(href).a;
          sendToApp(
            onUrlRequest(
              next &&
                curr.protocol === next.protocol &&
                curr.host === next.host &&
                curr.port_.a === next.port_.a
                ? $gren_lang$browser$Browser$Internal(next)
                : $gren_lang$browser$Browser$External(href),
            ),
          );
        }
      });
    },
    init: function (flags) {
      return A3(impl.init, flags, _Browser_getUrl(), key);
    },
    view: impl.view,
    update: impl.update,
    subscriptions: impl.subscriptions,
  });
}

function _Browser_getUrl() {
  return $gren_lang$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function (key, n) {
  return A2(
    $gren_lang$core$Task$perform,
    $gren_lang$core$Basics$never,
    _Scheduler_binding(function () {
      n && history.go(n);
      key();
    }),
  );
});

var _Browser_pushUrl = F2(function (key, url) {
  return A2(
    $gren_lang$core$Task$perform,
    $gren_lang$core$Basics$never,
    _Scheduler_binding(function () {
      history.pushState({}, "", url);
      key();
    }),
  );
});

var _Browser_replaceUrl = F2(function (key, url) {
  return A2(
    $gren_lang$core$Task$perform,
    $gren_lang$core$Basics$never,
    _Scheduler_binding(function () {
      history.replaceState({}, "", url);
      key();
    }),
  );
});

// GLOBAL EVENTS

var _Browser_fakeNode = {
  addEventListener: function () {},
  removeEventListener: function () {},
};
var _Browser_doc =
  typeof document !== "undefined" ? document : _Browser_fakeNode;
var _Browser_window =
  typeof window !== "undefined" ? window : _Browser_fakeNode;

var _Browser_on = F3(function (node, eventName, sendToSelf) {
  return _Scheduler_spawn(
    _Scheduler_binding(function (callback) {
      function handler(event) {
        _Scheduler_rawSpawn(sendToSelf(event));
      }
      node.addEventListener(
        eventName,
        handler,
        _VirtualDom_passiveSupported && { passive: true },
      );
      return function () {
        node.removeEventListener(eventName, handler);
      };
    }),
  );
});

var _Browser_decodeEvent = F2(function (decoder, event) {
  var result = _Json_runHelp(decoder, event);
  return $gren_lang$core$Result$isOk(result) ? $gren_lang$core$Maybe$Just(result.a) : $gren_lang$core$Maybe$Nothing;
});

// PAGE VISIBILITY

function _Browser_visibilityInfo() {
  return typeof _VirtualDom_doc.hidden !== "undefined"
    ? { hidden: "hidden", change: "visibilitychange" }
    : typeof _VirtualDom_doc.mozHidden !== "undefined"
      ? { hidden: "mozHidden", change: "mozvisibilitychange" }
      : typeof _VirtualDom_doc.msHidden !== "undefined"
        ? { hidden: "msHidden", change: "msvisibilitychange" }
        : typeof _VirtualDom_doc.webkitHidden !== "undefined"
          ? { hidden: "webkitHidden", change: "webkitvisibilitychange" }
          : { hidden: "hidden", change: "visibilitychange" };
}

// ANIMATION FRAMES

function _Browser_rAF() {
  return _Scheduler_binding(function (callback) {
    var id = _Browser_requestAnimationFrame(function () {
      callback(_Scheduler_succeed(Date.now()));
    });

    return function () {
      _Browser_cancelAnimationFrame(id);
    };
  });
}

function _Browser_now() {
  return _Scheduler_binding(function (callback) {
    callback(_Scheduler_succeed(Date.now()));
  });
}

// DOM STUFF

function _Browser_withNode(id, doStuff) {
  return _Scheduler_binding(function (callback) {
    _Browser_requestAnimationFrame(function () {
      var node = document.getElementById(id);
      callback(
        node
          ? _Scheduler_succeed(doStuff(node))
          : _Scheduler_fail($gren_lang$browser$Browser$Dom$NotFound(id)),
      );
    });
  });
}

function _Browser_withWindow(doStuff) {
  return _Scheduler_binding(function (callback) {
    _Browser_requestAnimationFrame(function () {
      callback(_Scheduler_succeed(doStuff()));
    });
  });
}

// FOCUS and BLUR

var _Browser_call = F2(function (functionName, id) {
  return _Browser_withNode(id, function (node) {
    node[functionName]();
    return {};
  });
});

// WINDOW VIEWPORT

function _Browser_getViewport() {
  return {
    scene: _Browser_getScene(),
    viewport: {
      x: _Browser_window.pageXOffset,
      y: _Browser_window.pageYOffset,
      width: _Browser_doc.documentElement.clientWidth,
      height: _Browser_doc.documentElement.clientHeight,
    },
  };
}

function _Browser_getScene() {
  var body = _Browser_doc.body;
  var elem = _Browser_doc.documentElement;
  return {
    width: Math.max(
      body.scrollWidth,
      body.offsetWidth,
      elem.scrollWidth,
      elem.offsetWidth,
      elem.clientWidth,
    ),
    height: Math.max(
      body.scrollHeight,
      body.offsetHeight,
      elem.scrollHeight,
      elem.offsetHeight,
      elem.clientHeight,
    ),
  };
}

var _Browser_setViewport = F2(function (x, y) {
  return _Browser_withWindow(function () {
    _Browser_window.scroll(x, y);
    return {};
  });
});

// ELEMENT VIEWPORT

function _Browser_getViewportOf(id) {
  return _Browser_withNode(id, function (node) {
    return {
      scene: {
        width: node.scrollWidth,
        height: node.scrollHeight,
      },
      viewport: {
        x: node.scrollLeft,
        y: node.scrollTop,
        width: node.clientWidth,
        height: node.clientHeight,
      },
    };
  });
}

var _Browser_setViewportOf = F3(function (id, x, y) {
  return _Browser_withNode(id, function (node) {
    node.scrollLeft = x;
    node.scrollTop = y;
    return {};
  });
});

// ELEMENT

function _Browser_getElement(id) {
  return _Browser_withNode(id, function (node) {
    var rect = node.getBoundingClientRect();
    var x = _Browser_window.pageXOffset;
    var y = _Browser_window.pageYOffset;
    return {
      scene: _Browser_getScene(),
      viewport: {
        x: x,
        y: y,
        width: _Browser_doc.documentElement.clientWidth,
        height: _Browser_doc.documentElement.clientHeight,
      },
      element: {
        x: x + rect.left,
        y: y + rect.top,
        width: rect.width,
        height: rect.height,
      },
    };
  });
}

// LOAD and RELOAD

function _Browser_reload(skipCache) {
  return A2(
    $gren_lang$core$Task$perform,
    $gren_lang$core$Basics$never,
    _Scheduler_binding(function (callback) {
      _VirtualDom_doc.location.reload(skipCache);
    }),
  );
}

function _Browser_load(url) {
  return A2(
    $gren_lang$core$Task$perform,
    $gren_lang$core$Basics$never,
    _Scheduler_binding(function (callback) {
      try {
        _Browser_window.location = url;
      } catch (err) {
        // Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
        // Other browsers reload the page, so let's be consistent about that.
        _VirtualDom_doc.location.reload(false);
      }
    }),
  );
}


// PROGRAMS

var _Platform_worker = F3(function (impl, flagDecoder, args) {
  return _Platform_initialize(
    flagDecoder,
    args,
    impl.init,
    impl.update,
    impl.subscriptions,
    function () {
      return function () {};
    },
  );
});

// INITIALIZE A PROGRAM

function _Platform_initialize(
  flagDecoder,
  args,
  init,
  update,
  subscriptions,
  stepperBuilder,
) {
  var flags;
  var rawFlags = args ? args["flags"] : undefined;

  if (flagDecoder === null) {
    if (!(rawFlags instanceof DataView)) {
      _Debug_crash(2 /**/, "Expected DataView as flags" /**/);
    }

    flags = _Platform_copyBytes(rawFlags);
  } else {
    var result = A2(
      _Json_run,
      flagDecoder,
      _Json_wrap(args ? args["flags"] : undefined),
    );

    $gren_lang$core$Result$isOk(result) ||
      _Debug_crash(2 /**/, _Json_errorToString(result.a) /**/);

    flags = result.a;
  }

  _Platform_setupTaskPorts(args ? args["taskPorts"] : undefined);

  var managers = {};
  var initPair = init(flags);
  var model = initPair.model;
  var stepper = stepperBuilder(sendToApp, model);
  var ports = _Platform_setupEffects(managers, sendToApp, executeCmd);

  function sendToApp(msg, viewMetadata) {
    var pair = A2(update, msg, model);
    stepper((model = pair.model), viewMetadata);
    _Platform_enqueueEffects(managers, pair.command, subscriptions(model));
  }

  function executeCmd(cmd) {
    _Platform_enqueueEffects(managers, cmd, subscriptions(model));
  }

  _Platform_enqueueEffects(managers, initPair.command, subscriptions(model));

  return ports ? { ports: ports } : {};
}

var _Platform_copyBytes = function (bytes) {
  return new DataView(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  );
};

// TRACK PRELOADS
//
// This is used by code in gren/browser and gren/http
// to register any HTTP requests that are triggered by init.
//

var _Platform_preload;

function _Platform_registerPreload(url) {
  _Platform_preload.add(url);
}

// EFFECT MANAGERS

var _Platform_effectManagers = {};

function _Platform_setupEffects(managers, sendToApp, executeCmd) {
  var ports;

  // setup all necessary effect managers
  for (var key in _Platform_effectManagers) {
    var manager = _Platform_effectManagers[key];

    if (manager.a) {
      ports = ports || {};
      ports[key] = manager.a(key, sendToApp);
    }

    managers[key] = _Platform_instantiateManager(
      manager,
      sendToApp,
      executeCmd,
    );
  }

  return ports;
}

function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap) {
  return {
    b: init,
    c: onEffects,
    d: onSelfMsg,
    e: cmdMap,
    f: subMap,
  };
}

function _Platform_instantiateManager(info, sendToApp, executeCmd) {
  var router = {
    g: sendToApp,
    h: executeCmd,
    i: undefined,
  };

  var onEffects = info.c;
  var onSelfMsg = info.d;
  var cmdMap = info.e;
  var subMap = info.f;

  function loop(state) {
    return A2(
      _Scheduler_andThen,
      loop,
      _Scheduler_receive(function (msg) {
        var value = msg.a;

        if (msg.$ === 0) {
          return A3(onSelfMsg, router, value, state);
        }

        return cmdMap && subMap
          ? A4(onEffects, router, value.j, value.k, state)
          : A3(onEffects, router, cmdMap ? value.j : value.k, state);
      }),
    );
  }

  return (router.i = _Scheduler_rawSpawn(
    A2(_Scheduler_andThen, loop, info.b),
  ));
}

// ROUTING

var _Platform_sendToApp = F2(function (router, msg) {
  return _Scheduler_binding(function (callback) {
    router.g(msg);
    callback(_Scheduler_succeed({}));
  });
});

var _Platform_sendToSelf = F2(function (router, msg) {
  return A2(_Scheduler_send, router.i, {
    $: 0,
    a: msg,
  });
});

var _Platform_executeCmd = F2(function (router, cmd) {
  return _Scheduler_binding(function (callback) {
    router.h(cmd);
    callback(_Scheduler_succeed({}));
  });
});

// BAGS

function _Platform_leaf(home) {
  return function (value) {
    return {
      $: 1,
      l: home,
      m: value,
    };
  };
}

function _Platform_batch(array) {
  return {
    $: 2,
    n: array,
  };
}

var _Platform_map = F2(function (tagger, bag) {
  return {
    $: 3,
    o: tagger,
    p: bag,
  };
});

// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/gren/core/issues/980
//   https://github.com/gren/core/pull/981
//   https://github.com/gren/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.

// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;

function _Platform_enqueueEffects(managers, cmdBag, subBag) {
  _Platform_effectsQueue.push({
    q: managers,
    r: cmdBag,
    s: subBag,
  });

  if (_Platform_effectsActive) return;

  _Platform_effectsActive = true;
  while (_Platform_effectsQueue.length > 0) {
    const activeEffects = _Platform_effectsQueue;
    _Platform_effectsQueue = [];

    for (const fx of activeEffects) {
      _Platform_dispatchEffects(fx.q, fx.r, fx.s);
    }
  }
  _Platform_effectsActive = false;
}

function _Platform_dispatchEffects(managers, cmdBag, subBag) {
  var effectsDict = {};
  _Platform_gatherEffects(true, cmdBag, effectsDict, null);
  _Platform_gatherEffects(false, subBag, effectsDict, null);

  for (var home in managers) {
    _Scheduler_rawSend(managers[home], {
      $: "fx",
      a: effectsDict[home] || { j: [], k: [] },
    });
  }
}

function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers) {
  switch (bag.$) {
    case 1:
      var home = bag.l;
      var effect = _Platform_toEffect(isCmd, home, taggers, bag.m);
      effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
      return;

    case 2:
      var bags = bag.n;
      for (var idx = 0; idx < bags.length; idx++) {
        _Platform_gatherEffects(isCmd, bags[idx], effectsDict, taggers);
      }
      return;

    case 3:
      _Platform_gatherEffects(isCmd, bag.p, effectsDict, {
        t: bag.o,
        u: taggers,
      });
      return;
  }
}

function _Platform_toEffect(isCmd, home, taggers, value) {
  function applyTaggers(x) {
    for (var temp = taggers; temp; temp = temp.u) {
      x = temp.t(x);
    }
    return x;
  }

  var map = isCmd
    ? _Platform_effectManagers[home].e
    : _Platform_effectManagers[home].f;

  return A2(map, applyTaggers, value);
}

function _Platform_insert(isCmd, newEffect, effects) {
  effects = effects || { j: [], k: [] };

  isCmd
    ? (effects.j = A2($gren_lang$core$Array$pushLast, newEffect, effects.j))
    : (effects.k = A2($gren_lang$core$Array$pushLast, newEffect, effects.k));

  return effects;
}

// PORTS

function _Platform_checkPortName(name) {
  if (_Platform_effectManagers[name]) {
    _Debug_crash(3, name);
  }

  if (_Platform_taskPorts[name]) {
    _Debug_crash(3, name);
  }
}

// OUTGOING PORTS

function _Platform_outgoingPort(name, converter, isBytes) {
  _Platform_checkPortName(name);
  _Platform_effectManagers[name] = {
    e: _Platform_outgoingPortMap,
    v: converter,
    a: (n) => _Platform_setupOutgoingPort(n, isBytes),
  };
  return _Platform_leaf(name);
}

var _Platform_outgoingPortMap = F2(function (tagger, value) {
  return value;
});

function _Platform_setupOutgoingPort(name, isBytes) {
  var subs = [];
  var converter = _Platform_effectManagers[name].v;

  // CREATE MANAGER

  var init = _Process_sleep(0);

  _Platform_effectManagers[name].b = init;
  _Platform_effectManagers[name].c = F3(
    function (router, cmdArray, state) {
      for (var idx = 0; idx < cmdArray.length; idx++) {
        // grab a separate reference to subs in case unsubscribe is called
        var currentSubs = subs;
        var rawValue = converter(cmdArray[idx]);
        var value = isBytes
          ? _Platform_copyBytes(rawValue)
          : _Json_unwrap(rawValue);
        for (var subIdx = 0; subIdx < currentSubs.length; subIdx++) {
          currentSubs[subIdx](value);
        }
      }
      return init;
    },
  );

  // PUBLIC API

  function subscribe(callback) {
    subs.push(callback);
  }

  function unsubscribe(callback) {
    // copy subs into a new array in case unsubscribe is called within a
    // subscribed callback
    subs = subs.slice();
    var index = subs.indexOf(callback);
    if (index >= 0) {
      subs.splice(index, 1);
    }
  }

  return {
    subscribe: subscribe,
    unsubscribe: unsubscribe,
  };
}

// INCOMING PORTS

function _Platform_incomingPort(name, converter, isBytes) {
  _Platform_checkPortName(name);
  _Platform_effectManagers[name] = {
    f: _Platform_incomingPortMap,
    v: converter,
    a: (n, s) => _Platform_setupIncomingPort(n, s, isBytes),
  };
  return _Platform_leaf(name);
}

var _Platform_incomingPortMap = F2(function (tagger, finalTagger) {
  return function (value) {
    return tagger(finalTagger(value));
  };
});

function _Platform_setupIncomingPort(name, sendToApp, isBytes) {
  var subs = [];
  var converter = _Platform_effectManagers[name].v;

  // CREATE MANAGER

  var init = _Scheduler_succeed(null);

  _Platform_effectManagers[name].b = init;
  _Platform_effectManagers[name].c = F3(
    function (router, subArray, state) {
      subs = subArray;
      return init;
    },
  );

  // PUBLIC API

  function send(incomingValue) {
    var value;

    if (isBytes) {
      if (!(incomingValue instanceof DataView)) {
        _Debug_crash(4, name, "Expected DataView");
      }

      value = _Platform_copyBytes(incomingValue);
    } else {
      var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

      $gren_lang$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

      value = result.a;
    }

    for (var idx = 0; idx < subs.length; idx++) {
      sendToApp(subs[idx](value));
    }
  }

  return { send: send };
}

// TASK PORTS

var _Platform_taskPorts = {};

function _Platform_taskPort(
  name,
  inputConverter,
  converter,
  inputIsBytes,
  outputIsBytes,
) {
  _Platform_checkPortName(name);
  _Platform_taskPorts[name] = {};

  return function (input) {
    var encodedInput = inputConverter
      ? inputIsBytes
        ? _Platform_copyBytes(input)
        : _Json_unwrap(inputConverter(input))
      : null;

    return _Scheduler_binding(function (callback) {
      var promise;
      try {
        promise = _Platform_taskPorts[name](encodedInput);
      } catch (e) {
        throw new Error(
          "Registered code for task-based port named '" + name + "'  crashed.",
          { cause: e },
        );
      }

      if (!(promise instanceof Promise)) {
        throw new Error(
          "Handler for task port named '" +
            name +
            "' did not return a Promise.",
        );
      }

      promise.then(
        function (value) {
          var checkedValue;

          if (outputIsBytes) {
            if (!(value instanceof DataView)) {
              _Debug_crash(4, name, "Expected DataView");
            }

            checkedValue = _Platform_copyBytes(value);
          } else {
            var result = A2(_Json_run, converter, _Json_wrap(value));

            $gren_lang$core$Result$isOk(result) || _Debug_crash(4, name, value);

            checkedValue = result.a;
          }

          callback(_Scheduler_succeed(checkedValue));
        },
        function (err) {
          // If Error, convert to plain object. This is because Error doesn't have enumerable
          // properties.
          if (err instanceof Error) {
            var newErr = {};
            Object.getOwnPropertyNames(err).forEach(function (key) {
              newErr[key] = err[key];
            });

            err = newErr;
          }

          callback(_Scheduler_fail(_Json_wrap(err)));
        },
      );
    });
  };
}

function _Platform_setupTaskPorts(registeredPorts) {
  if (typeof registeredPorts !== "object") {
    registeredPorts = {};
  }

  for (var key in registeredPorts) {
    if (!(key in _Platform_taskPorts)) {
      // TODO: proper way to crash program
      throw new Error(
        key + " isn't defined as a task-based port in Gren code.",
      );
    }
  }

  for (var key in _Platform_taskPorts) {
    var handler = registeredPorts[key];
    if (!handler) {
      throw new Error("No handler defined for task port named '" + key + "'.");
    }

    if (!(handler instanceof Function)) {
      throw new Error(
        "Handler for task port named '" + key + "' is not a function.",
      );
    }

    _Platform_taskPorts[key] = handler;
  }
}

// EXPORT GREN MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//

function _Platform_export_UNUSED(exports) {
  scope["Gren"]
    ? _Platform_mergeExportsProd(scope["Gren"], exports)
    : (scope["Gren"] = exports);
}

function _Platform_mergeExportsProd(obj, exports) {
  for (var name in exports) {
    name in obj
      ? name == "init"
        ? _Debug_crash(6)
        : _Platform_mergeExportsProd(obj[name], exports[name])
      : (obj[name] = exports[name]);
  }
}

function _Platform_export(exports) {
  scope["Gren"]
    ? _Platform_mergeExportsDebug("Gren", scope["Gren"], exports)
    : (scope["Gren"] = exports);
}

function _Platform_mergeExportsDebug(moduleName, obj, exports) {
  for (var name in exports) {
    name in obj
      ? name == "init"
        ? _Debug_crash(6, moduleName)
        : _Platform_mergeExportsDebug(
            moduleName + "." + name,
            obj[name],
            exports[name],
          )
      : (obj[name] = exports[name]);
  }
}


function _Process_sleep(time) {
  return _Scheduler_binding(function (callback) {
    var id = setTimeout(function () {
      callback(_Scheduler_succeed({}));
    }, time);

    return function () {
      clearTimeout(id);
    };
  });
}


// TASKS

function _Scheduler_succeed(value) {
  return {
    $: 0,
    a: value,
  };
}

function _Scheduler_fail(error) {
  return {
    $: 1,
    a: error,
  };
}

function _Scheduler_binding(callback) {
  return {
    $: 2,
    b: callback,
    c: null,
  };
}

var _Scheduler_andThen = F2(function (callback, task) {
  return {
    $: 3,
    b: callback,
    d: task,
  };
});

var _Scheduler_onError = F2(function (callback, task) {
  return {
    $: 4,
    b: callback,
    d: task,
  };
});

function _Scheduler_receive(callback) {
  return {
    $: 5,
    b: callback,
  };
}

function _Scheduler_concurrent(tasks) {
  if (tasks.length === 0) return _Scheduler_succeed([]);

  return _Scheduler_binding(function (callback) {
    let count = 0;
    let results = new Array(tasks.length);
    let procs;

    function killAll() {
      procs.forEach(_Scheduler_rawKill);
    }

    function onError(e) {
      killAll();
      callback(_Scheduler_fail(e));
    }

    procs = tasks.map((task, i) => {
      function onSuccess(res) {
        results[i] = res;
        count++;
        if (count === tasks.length) {
          callback(_Scheduler_succeed(results));
        }
      }
      const success = A2(_Scheduler_andThen, onSuccess, task);
      const handled = A2(_Scheduler_onError, onError, success);
      return _Scheduler_rawSpawn(handled);
    });

    return killAll;
  });
}

var _Scheduler_map2 = F3(function (callback, taskA, taskB) {
  function combine([resA, resB]) {
    return _Scheduler_succeed(A2(callback, resA, resB));
  }
  return A2(_Scheduler_andThen, combine, _Scheduler_concurrent([taskA, taskB]));
});

// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task) {
  var proc = {
    $: 0,
    e: _Scheduler_guid++,
    f: false,
    g: task,
    h: null,
    i: [],
  };

  _Scheduler_enqueue(proc);

  return proc;
}

function _Scheduler_spawn(task) {
  return _Scheduler_binding(function (callback) {
    callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
  });
}

function _Scheduler_rawSend(proc, msg) {
  proc.i.push(msg);
  _Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function (proc, msg) {
  return _Scheduler_binding(function (callback) {
    _Scheduler_rawSend(proc, msg);
    callback(_Scheduler_succeed({}));
  });
});

function _Scheduler_kill(proc) {
  return _Scheduler_binding(function (callback) {
    _Scheduler_rawKill(proc);

    callback(_Scheduler_succeed({}));
  });
}

function _Scheduler_rawKill(proc) {
  var task = proc.g;
  if (task && task.$ === 2 && task.c) {
    task.c();
  }

  proc.g = null;
}

/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , parked : Bool
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/

var _Scheduler_working = false;
var _Scheduler_queue = [];

function _Scheduler_enqueue(proc) {
  _Scheduler_queue.push(proc);
  if (_Scheduler_working) {
    return;
  }
  _Scheduler_working = true;
  // Make sure tasks created during _step are run
  while (_Scheduler_queue.length > 0) {
    const activeProcs = _Scheduler_queue;
    _Scheduler_queue = [];

    for (const proc of activeProcs) {
      if (!proc.f) {
        _Scheduler_step(proc);
      }
    }
  }
  _Scheduler_working = false;
}

function _Scheduler_step(proc) {
  while (proc.g) {
    var rootTag = proc.g.$;
    if (rootTag === 0 || rootTag === 1) {
      while (proc.h && proc.h.$ !== rootTag) {
        proc.h = proc.h.j;
      }
      if (!proc.h) {
        return;
      }
      proc.g = proc.h.b(proc.g.a);
      proc.h = proc.h.j;
    } else if (rootTag === 2) {
      // prevents new step while waiting for binding to complete
      proc.f = true;
      proc.g.c = proc.g.b(function (newRoot) {
        proc.f = false;

        // the process might have been killed, in which case root will be null
        if (proc.g == null) {
          return;
        }

        proc.g = newRoot;
        _Scheduler_enqueue(proc);
      });
      return;
    } else if (rootTag === 5) {
      if (proc.i.length === 0) {
        return;
      }
      proc.g = proc.g.b(proc.i.shift());
    } // if (rootTag === 3 || rootTag === 4)
    else {
      proc.h = {
        $: rootTag === 3 ? 0 : 1,
        b: proc.g.b,
        j: proc.h,
      };
      proc.g = proc.g.d;
    }
  }
}


// HELPERS

var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== "undefined" ? document : {};

function _VirtualDom_appendChild(parent, child) {
  parent.appendChild(child);
}

var _VirtualDom_init = F2(function (virtualNode, args) {
  // NOTE: this function needs _Platform_export available to work

  /**_UNUSED/
	var node = args['node'];
	//*/
  /**/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

  node.parentNode.replaceChild(
    _VirtualDom_render(virtualNode, function () {}),
    node,
  );

  return {};
});

// TEXT

function _VirtualDom_text(string) {
  return {
    $: 0,
    a: string,
  };
}

// NODE

var _VirtualDom_nodeNS = F2(function (namespace, tag) {
  return F2(function (factList, kids) {
    for (var descendantsCount = 0, i = 0; i < kids.length; i++) {
      var kid = kids[i];
      descendantsCount += kid.b || 0;
    }

    descendantsCount += kids.length;

    return {
      $: 1,
      c: tag,
      d: _VirtualDom_organizeFacts(factList),
      e: kids,
      f: namespace,
      b: descendantsCount,
    };
  });
});

var _VirtualDom_node = function (tag) {
  return A2(_VirtualDom_nodeNS, undefined, tag);
};

// KEYED NODE

var _VirtualDom_keyedNodeNS = F2(function (namespace, tag) {
  return F2(function (factList, kids) {
    for (var descendantsCount = 0, i = 0; i < kids.length; i++) {
      var kid = kids[i];
      descendantsCount += kid.node.b || 0;
    }

    descendantsCount += kids.length;

    return {
      $: 2,
      c: tag,
      d: _VirtualDom_organizeFacts(factList),
      e: kids,
      f: namespace,
      b: descendantsCount,
    };
  });
});

var _VirtualDom_keyedNode = function (tag) {
  return A2(_VirtualDom_keyedNodeNS, undefined, tag);
};

// CUSTOM

function _VirtualDom_custom(factList, model, render, diff) {
  return {
    $: 3,
    d: _VirtualDom_organizeFacts(factList),
    g: model,
    h: render,
    i: diff,
  };
}

// MAP

var _VirtualDom_map = F2(function (tagger, node) {
  return {
    $: 4,
    j: tagger,
    k: node,
    b: 1 + (node.b || 0),
  };
});

// LAZY

function _VirtualDom_thunk(view, args, thunk) {
  return {
    $: 5,
    l: view,
    m: args,
    n: thunk,
    k: undefined,
  };
}

var _VirtualDom_lazy = F2(function (func, a) {
  return _VirtualDom_thunk(func, [a], function () {
    return func(a);
  });
});

var _VirtualDom_lazy2 = F3(function (func, a, b) {
  return _VirtualDom_thunk(func, [a, b], function () {
    return A2(func, a, b);
  });
});

var _VirtualDom_lazy3 = F4(function (func, a, b, c) {
  return _VirtualDom_thunk(func, [a, b, c], function () {
    return A3(func, a, b, c);
  });
});

var _VirtualDom_lazy4 = F5(function (func, a, b, c, d) {
  return _VirtualDom_thunk(func, [a, b, c, d], function () {
    return A4(func, a, b, c, d);
  });
});

var _VirtualDom_lazy5 = F6(function (func, a, b, c, d, e) {
  return _VirtualDom_thunk(func, [a, b, c, d, e], function () {
    return A5(func, a, b, c, d, e);
  });
});

var _VirtualDom_lazy6 = F7(function (func, a, b, c, d, e, f) {
  return _VirtualDom_thunk(func, [a, b, c, d, e, f], function () {
    return A6(func, a, b, c, d, e, f);
  });
});

var _VirtualDom_lazy7 = F8(function (func, a, b, c, d, e, f, g) {
  return _VirtualDom_thunk(func, [a, b, c, d, e, f, g], function () {
    return A7(func, a, b, c, d, e, f, g);
  });
});

var _VirtualDom_lazy8 = F9(function (func, a, b, c, d, e, f, g, h) {
  return _VirtualDom_thunk(func, [a, b, c, d, e, f, g, h], function () {
    return A8(func, a, b, c, d, e, f, g, h);
  });
});

// FACTS

var _VirtualDom_on = F2(function (key, handler) {
  return {
    $: "a0",
    o: key,
    p: handler,
  };
});
var _VirtualDom_style = F2(function (key, value) {
  return {
    $: "a1",
    o: key,
    p: value,
  };
});
var _VirtualDom_property = F2(function (key, value) {
  return {
    $: "a2",
    o: key,
    p: value,
  };
});
var _VirtualDom_attribute = F2(function (key, value) {
  return {
    $: "a3",
    o: key,
    p: value,
  };
});
var _VirtualDom_attributeNS = F3(function (namespace, key, value) {
  return {
    $: "a4",
    o: key,
    p: { f: namespace, p: value },
  };
});

// XSS ATTACK VECTOR CHECKS

function _VirtualDom_noScript(tag) {
  return tag == "script" ? "p" : tag;
}

function _VirtualDom_noOnOrFormAction(key) {
  return /^(on|formAction$)/i.test(key) ? "data-" + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key) {
  return key == "innerHTML" || key == "outerHTML" || key == "formAction"
    ? "data-" + key
    : key;
}

function _VirtualDom_noJavaScriptUri_UNUSED(value) {
  return /^javascript:/i.test(value.replace(/\s/g, "")) ? "" : value;
}

function _VirtualDom_noJavaScriptUri(value) {
  return /^javascript:/i.test(value.replace(/\s/g, ""))
    ? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
    : value;
}

function _VirtualDom_noJavaScriptOrHtmlUri_UNUSED(value) {
  return /^\s*(javascript:|data:text\/html)/i.test(value) ? "" : value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value) {
  return /^\s*(javascript:|data:text\/html)/i.test(value)
    ? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
    : value;
}

// MAP FACTS

var _VirtualDom_mapAttribute = F2(function (func, attr) {
  return attr.$ === "a0"
    ? A2(_VirtualDom_on, attr.o, _VirtualDom_mapHandler(func, attr.p))
    : attr;
});

function _VirtualDom_mapHandler(func, handler) {
  var tag = $gren_lang$browser$VirtualDom$toHandlerInt(handler);

  // 0 = Normal
  // 1 = MayStopPropagation
  // 2 = MayPreventDefault
  // 3 = Custom

  var mappedDecoder;
  switch (tag) {
    case 0:
      mappedDecoder = A2($gren_lang$core$Json$Decode$map, func, handler.a);
      break;
    case 1:
      mappedDecoder = A3(
        $gren_lang$core$Json$Decode$map2,
        _VirtualDom_mapMayStopPropagation,
        $gren_lang$core$Json$Decode$succeed(func),
        handler.a,
      );
      break;
    case 2:
      mappedDecoder = A3(
        $gren_lang$core$Json$Decode$map2,
        _VirtualDom_mapMayPreventDefault,
        $gren_lang$core$Json$Decode$succeed(func),
        handler.a,
      );
      break;
    case 3:
      mappedDecoder = A3(
        $gren_lang$core$Json$Decode$map2,
        _VirtualDom_mapEventRecord,
        $gren_lang$core$Json$Decode$succeed(func),
        handler.a,
      );
      break;
  }

  return {
    $: handler.$,
    a: mappedDecoder,
  };
}

var _VirtualDom_mapMayStopPropagation = F2(function (func, record) {
  return {
    message: func(record.message),
    stopPropagation: record.stopPropagation,
  };
});

var _VirtualDom_mapMayPreventDefault = F2(function (func, record) {
  return {
    message: func(record.message),
    preventDefault: record.preventDefault,
  };
});

var _VirtualDom_mapEventRecord = F2(function (func, record) {
  return {
    message: func(record.message),
    stopPropagation: record.stopPropagation,
    preventDefault: record.preventDefault,
  };
});

// ORGANIZE FACTS

function _VirtualDom_organizeFacts(factList) {
  for (var facts = {}, i = 0; i < factList.length; i++) {
    var entry = factList[i];

    var tag = entry.$;
    var key = entry.o;
    var value = entry.p;

    if (tag === "a2") {
      key === "className"
        ? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
        : (facts[key] = _Json_unwrap(value));

      continue;
    }

    var subFacts = facts[tag] || (facts[tag] = {});
    tag === "a3" && key === "class"
      ? _VirtualDom_addClass(subFacts, key, value)
      : (subFacts[key] = value);
  }

  return facts;
}

function _VirtualDom_addClass(object, key, newClass) {
  var classes = object[key];
  object[key] = classes ? classes + " " + newClass : newClass;
}

// RENDER

function _VirtualDom_render(vNode, eventNode) {
  var tag = vNode.$;

  if (tag === 5) {
    return _VirtualDom_render(
      vNode.k || (vNode.k = vNode.n()),
      eventNode,
    );
  }

  if (tag === 0) {
    return _VirtualDom_doc.createTextNode(vNode.a);
  }

  if (tag === 4) {
    var subNode = vNode.k;
    var tagger = vNode.j;

    while (subNode.$ === 4) {
      typeof tagger !== "object"
        ? (tagger = [tagger, subNode.j])
        : tagger.push(subNode.j);

      subNode = subNode.k;
    }

    var subEventRoot = { j: tagger, q: eventNode };
    var domNode = _VirtualDom_render(subNode, subEventRoot);
    domNode.gren_event_node_ref = subEventRoot;
    return domNode;
  }

  if (tag === 3) {
    var domNode = vNode.h(vNode.g);
    _VirtualDom_applyFacts(domNode, eventNode, vNode.d);
    return domNode;
  }

  // at this point `tag` must be 1 or 2

  var domNode = vNode.f
    ? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
    : _VirtualDom_doc.createElement(vNode.c);

  if (_VirtualDom_divertHrefToApp && vNode.c == "a") {
    domNode.addEventListener("click", _VirtualDom_divertHrefToApp(domNode));
  }

  _VirtualDom_applyFacts(domNode, eventNode, vNode.d);

  for (var kids = vNode.e, i = 0; i < kids.length; i++) {
    _VirtualDom_appendChild(
      domNode,
      _VirtualDom_render(
        tag === 1 ? kids[i] : kids[i].node,
        eventNode,
      ),
    );
  }

  return domNode;
}

// APPLY FACTS

function _VirtualDom_applyFacts(domNode, eventNode, facts) {
  for (var key in facts) {
    var value = facts[key];

    key === "a1"
      ? _VirtualDom_applyStyles(domNode, value)
      : key === "a0"
        ? _VirtualDom_applyEvents(domNode, eventNode, value)
        : key === "a3"
          ? _VirtualDom_applyAttrs(domNode, value)
          : key === "a4"
            ? _VirtualDom_applyAttrsNS(domNode, value)
            : ((key !== "value" && key !== "checked") ||
                domNode[key] !== value) &&
              (domNode[key] = value);
  }
}

// APPLY STYLES

function _VirtualDom_applyStyles(domNode, styles) {
  var domNodeStyle = domNode.style;

  for (var key in styles) {
    domNodeStyle[key] = styles[key];
  }
}

// APPLY ATTRS

function _VirtualDom_applyAttrs(domNode, attrs) {
  for (var key in attrs) {
    var value = attrs[key];
    typeof value !== "undefined"
      ? domNode.setAttribute(key, value)
      : domNode.removeAttribute(key);
  }
}

// APPLY NAMESPACED ATTRS

function _VirtualDom_applyAttrsNS(domNode, nsAttrs) {
  for (var key in nsAttrs) {
    var pair = nsAttrs[key];
    var namespace = pair.f;
    var value = pair.p;

    typeof value !== "undefined"
      ? domNode.setAttributeNS(namespace, key, value)
      : domNode.removeAttributeNS(namespace, key);
  }
}

// APPLY EVENTS

function _VirtualDom_applyEvents(domNode, eventNode, events) {
  var allCallbacks = domNode.grenFs || (domNode.grenFs = {});

  for (var key in events) {
    var newHandler = events[key];
    var oldCallback = allCallbacks[key];

    if (!newHandler) {
      domNode.removeEventListener(key, oldCallback);
      allCallbacks[key] = undefined;
      continue;
    }

    if (oldCallback) {
      var oldHandler = oldCallback.r;
      if (oldHandler.$ === newHandler.$) {
        oldCallback.r = newHandler;
        continue;
      }
      domNode.removeEventListener(key, oldCallback);
    }

    oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
    domNode.addEventListener(
      key,
      oldCallback,
      _VirtualDom_passiveSupported && {
        passive: $gren_lang$browser$VirtualDom$toHandlerInt(newHandler) < 2,
      },
    );
    allCallbacks[key] = oldCallback;
  }
}

// PASSIVE EVENTS

var _VirtualDom_passiveSupported;

try {
  window.addEventListener(
    "t",
    null,
    Object.defineProperty({}, "passive", {
      get: function () {
        _VirtualDom_passiveSupported = true;
      },
    }),
  );
} catch (e) {}

// EVENT HANDLERS

function _VirtualDom_makeCallback(eventNode, initialHandler) {
  function callback(event) {
    var handler = callback.r;
    var result = _Json_runHelp(handler.a, event);

    if (!$gren_lang$core$Result$isOk(result)) {
      return;
    }

    var tag = $gren_lang$browser$VirtualDom$toHandlerInt(handler);

    // 0 = Normal
    // 1 = MayStopPropagation
    // 2 = MayPreventDefault
    // 3 = Custom

    var value = result.a;
    var message = !tag ? value : value.message;
    var stopPropagation =
      tag == 1 || tag == 3 ? value.stopPropagation : false;
    var currentEventNode =
      (stopPropagation && event.stopPropagation(),
      (tag == 2 || tag == 3 ? value.preventDefault : false) &&
        event.preventDefault(),
      eventNode);
    var tagger;
    var i;
    while ((tagger = currentEventNode.j)) {
      if (typeof tagger == "function") {
        message = tagger(message);
      } else {
        for (var i = tagger.length; i--; ) {
          message = tagger[i](message);
        }
      }
      currentEventNode = currentEventNode.q;
    }
    currentEventNode(message, stopPropagation); // stopPropagation implies isSync
  }

  callback.r = initialHandler;

  return callback;
}

function _VirtualDom_equalEvents(x, y) {
  return x.$ == y.$ && _Json_equality(x.a, y.a);
}

// DIFF

// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y) {
  var patches = [];
  _VirtualDom_diffHelp(x, y, patches, 0);
  return patches;
}

function _VirtualDom_pushPatch(patches, type, index, data) {
  var patch = {
    $: type,
    s: index,
    t: data,
    u: undefined,
    v: undefined,
  };
  patches.push(patch);
  return patch;
}

function _VirtualDom_diffHelp(x, y, patches, index) {
  if (x === y) {
    return;
  }

  var xType = x.$;
  var yType = y.$;

  // Bail if you run into different types of nodes. Implies that the
  // structure has changed significantly and it's not worth a diff.
  if (xType !== yType) {
    if (xType === 1 && yType === 2) {
      y = _VirtualDom_dekey(y);
      yType = 1;
    } else {
      _VirtualDom_pushPatch(patches, 0, index, y);
      return;
    }
  }

  // Now we know that both nodes are the same $.
  switch (yType) {
    case 5:
      var xArgs = x.m;
      var yArgs = y.m;
      var i = xArgs.length;
      var same = i === yArgs.length && x.l === y.l;
      while (same && i--) {
        same = _Utils_eq(xArgs[i], yArgs[i]);
      }
      if (same) {
        y.k = x.k;
        return;
      }
      y.k = y.n();
      var subPatches = [];
      _VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
      subPatches.length > 0 &&
        _VirtualDom_pushPatch(patches, 1, index, subPatches);
      return;

    case 4:
      // gather nested taggers
      var xTaggers = x.j;
      var yTaggers = y.j;
      var nesting = false;

      var xSubNode = x.k;
      while (xSubNode.$ === 4) {
        nesting = true;

        typeof xTaggers !== "object"
          ? (xTaggers = [xTaggers, xSubNode.j])
          : xTaggers.push(xSubNode.j);

        xSubNode = xSubNode.k;
      }

      var ySubNode = y.k;
      while (ySubNode.$ === 4) {
        nesting = true;

        typeof yTaggers !== "object"
          ? (yTaggers = [yTaggers, ySubNode.j])
          : yTaggers.push(ySubNode.j);

        ySubNode = ySubNode.k;
      }

      // Just bail if different numbers of taggers. This implies the
      // structure of the virtual DOM has changed.
      if (nesting && xTaggers.length !== yTaggers.length) {
        _VirtualDom_pushPatch(patches, 0, index, y);
        return;
      }

      // check if taggers are "the same"
      if (
        nesting
          ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers)
          : xTaggers !== yTaggers
      ) {
        _VirtualDom_pushPatch(patches, 2, index, yTaggers);
      }

      // diff everything below the taggers
      _VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
      return;

    case 0:
      if (x.a !== y.a) {
        _VirtualDom_pushPatch(patches, 3, index, y.a);
      }
      return;

    case 1:
      _VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
      return;

    case 2:
      _VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
      return;

    case 3:
      if (x.h !== y.h) {
        _VirtualDom_pushPatch(patches, 0, index, y);
        return;
      }

      var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
      factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

      var patch = y.i(x.g, y.g);
      patch && _VirtualDom_pushPatch(patches, 5, index, patch);

      return;
  }
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs) {
  for (var i = 0; i < as.length; i++) {
    if (as[i] !== bs[i]) {
      return false;
    }
  }

  return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids) {
  // Bail if obvious indicators have changed. Implies more serious
  // structural changes such that it's not worth it to diff.
  if (x.c !== y.c || x.f !== y.f) {
    _VirtualDom_pushPatch(patches, 0, index, y);
    return;
  }

  var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
  factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

  diffKids(x, y, patches, index);
}

// DIFF FACTS

// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category) {
  var diff;

  // look for changes and removals
  for (var xKey in x) {
    if (
      xKey === "a1" ||
      xKey === "a0" ||
      xKey === "a3" ||
      xKey === "a4"
    ) {
      var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
      if (subDiff) {
        diff = diff || {};
        diff[xKey] = subDiff;
      }
      continue;
    }

    // remove if not in the new facts
    if (!(xKey in y)) {
      diff = diff || {};
      diff[xKey] = !category
        ? typeof x[xKey] === "string"
          ? ""
          : null
        : category === "a1"
          ? ""
          : category === "a0" || category === "a3"
            ? undefined
            : { f: x[xKey].f, p: undefined };

      continue;
    }

    var xValue = x[xKey];
    var yValue = y[xKey];

    // reference equal, so don't worry about it
    if (
      (xValue === yValue && xKey !== "value" && xKey !== "checked") ||
      (category === "a0" && _VirtualDom_equalEvents(xValue, yValue))
    ) {
      continue;
    }

    diff = diff || {};
    diff[xKey] = yValue;
  }

  // add new stuff
  for (var yKey in y) {
    if (!(yKey in x)) {
      diff = diff || {};
      diff[yKey] = y[yKey];
    }
  }

  return diff;
}

// DIFF KIDS

function _VirtualDom_diffKids(xParent, yParent, patches, index) {
  var xKids = xParent.e;
  var yKids = yParent.e;

  var xLen = xKids.length;
  var yLen = yKids.length;

  // FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

  if (xLen > yLen) {
    _VirtualDom_pushPatch(patches, 6, index, {
      w: yLen,
      i: xLen - yLen,
    });
  } else if (xLen < yLen) {
    _VirtualDom_pushPatch(patches, 7, index, {
      w: xLen,
      e: yKids,
    });
  }

  // PAIRWISE DIFF EVERYTHING ELSE

  for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++) {
    var xKid = xKids[i];
    _VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
    index += xKid.b || 0;
  }
}

// KEYED DIFF

function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex) {
  var localPatches = [];

  var changes = {}; // Dict String Entry
  var inserts = []; // Array { index : Int, entry : Entry }
  // type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

  var xKids = xParent.e;
  var yKids = yParent.e;
  var xLen = xKids.length;
  var yLen = yKids.length;
  var xIndex = 0;
  var yIndex = 0;

  var index = rootIndex;

  while (xIndex < xLen && yIndex < yLen) {
    var x = xKids[xIndex];
    var y = yKids[yIndex];

    var xKey = x.key;
    var yKey = y.key;
    var xNode = x.node;
    var yNode = y.node;

    var newMatch = undefined;
    var oldMatch = undefined;

    // check if keys match

    if (xKey === yKey) {
      index++;
      _VirtualDom_diffHelp(xNode, yNode, localPatches, index);
      index += xNode.b || 0;

      xIndex++;
      yIndex++;
      continue;
    }

    // look ahead 1 to detect insertions and removals.

    var xNext = xKids[xIndex + 1];
    var yNext = yKids[yIndex + 1];

    if (xNext) {
      var xNextKey = xNext.key;
      var xNextNode = xNext.node;
      oldMatch = yKey === xNextKey;
    }

    if (yNext) {
      var yNextKey = yNext.key;
      var yNextNode = yNext.node;
      newMatch = xKey === yNextKey;
    }

    // swap x and y
    if (newMatch && oldMatch) {
      index++;
      _VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
      _VirtualDom_insertNode(
        changes,
        localPatches,
        xKey,
        yNode,
        yIndex,
        inserts,
      );
      index += xNode.b || 0;

      index++;
      _VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
      index += xNextNode.b || 0;

      xIndex += 2;
      yIndex += 2;
      continue;
    }

    // insert y
    if (newMatch) {
      index++;
      _VirtualDom_insertNode(
        changes,
        localPatches,
        yKey,
        yNode,
        yIndex,
        inserts,
      );
      _VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
      index += xNode.b || 0;

      xIndex += 1;
      yIndex += 2;
      continue;
    }

    // remove x
    if (oldMatch) {
      index++;
      _VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
      index += xNode.b || 0;

      index++;
      _VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
      index += xNextNode.b || 0;

      xIndex += 2;
      yIndex += 1;
      continue;
    }

    // remove x, insert y
    if (xNext && xNextKey === yNextKey) {
      index++;
      _VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
      _VirtualDom_insertNode(
        changes,
        localPatches,
        yKey,
        yNode,
        yIndex,
        inserts,
      );
      index += xNode.b || 0;

      index++;
      _VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
      index += xNextNode.b || 0;

      xIndex += 2;
      yIndex += 2;
      continue;
    }

    break;
  }

  // eat up any remaining nodes with removeNode and insertNode

  while (xIndex < xLen) {
    index++;
    var x = xKids[xIndex];
    var xNode = x.node;
    _VirtualDom_removeNode(changes, localPatches, x.key, xNode, index);
    index += xNode.b || 0;
    xIndex++;
  }

  while (yIndex < yLen) {
    var endInserts = endInserts || [];
    var y = yKids[yIndex];
    _VirtualDom_insertNode(
      changes,
      localPatches,
      y.key,
      y.node,
      undefined,
      endInserts,
    );
    yIndex++;
  }

  if (localPatches.length > 0 || inserts.length > 0 || endInserts) {
    _VirtualDom_pushPatch(patches, 8, rootIndex, {
      x: localPatches,
      y: inserts,
      z: endInserts,
    });
  }
}

// CHANGES FROM KEYED DIFF

var _VirtualDom_POSTFIX = "_grenW6BL";

function _VirtualDom_insertNode(
  changes,
  localPatches,
  key,
  vnode,
  yIndex,
  inserts,
) {
  var entry = changes[key];

  // never seen this key before
  if (!entry) {
    entry = {
      c: 0,
      A: vnode,
      s: yIndex,
      t: undefined,
    };

    inserts.push({ s: yIndex, B: entry });
    changes[key] = entry;

    return;
  }

  // this key was removed earlier, a match!
  if (entry.c === 1) {
    inserts.push({ s: yIndex, B: entry });

    entry.c = 2;
    var subPatches = [];
    _VirtualDom_diffHelp(entry.A, vnode, subPatches, entry.s);
    entry.s = yIndex;
    entry.t.t = {
      x: subPatches,
      B: entry,
    };

    return;
  }

  // this key has already been inserted or moved, a duplicate!
  _VirtualDom_insertNode(
    changes,
    localPatches,
    key + _VirtualDom_POSTFIX,
    vnode,
    yIndex,
    inserts,
  );
}

function _VirtualDom_removeNode(changes, localPatches, key, vnode, index) {
  var entry = changes[key];

  // never seen this key before
  if (!entry) {
    var patch = _VirtualDom_pushPatch(
      localPatches,
      9,
      index,
      undefined,
    );

    changes[key] = {
      c: 1,
      A: vnode,
      s: index,
      t: patch,
    };

    return;
  }

  // this key was inserted earlier, a match!
  if (entry.c === 0) {
    entry.c = 2;
    var subPatches = [];
    _VirtualDom_diffHelp(vnode, entry.A, subPatches, index);

    _VirtualDom_pushPatch(localPatches, 9, index, {
      x: subPatches,
      B: entry,
    });

    return;
  }

  // this key has already been removed or moved, a duplicate!
  _VirtualDom_removeNode(
    changes,
    localPatches,
    key + _VirtualDom_POSTFIX,
    vnode,
    index,
  );
}

// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.

function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode) {
  _VirtualDom_addDomNodesHelp(
    domNode,
    vNode,
    patches,
    0,
    0,
    vNode.b,
    eventNode,
  );
}

// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(
  domNode,
  vNode,
  patches,
  i,
  low,
  high,
  eventNode,
) {
  var patch = patches[i];
  var index = patch.s;

  while (index === low) {
    var patchType = patch.$;

    if (patchType === 1) {
      _VirtualDom_addDomNodes(domNode, vNode.k, patch.t, eventNode);
    } else if (patchType === 8) {
      patch.u = domNode;
      patch.v = eventNode;

      var subPatches = patch.t.x;
      if (subPatches.length > 0) {
        _VirtualDom_addDomNodesHelp(
          domNode,
          vNode,
          subPatches,
          0,
          low,
          high,
          eventNode,
        );
      }
    } else if (patchType === 9) {
      patch.u = domNode;
      patch.v = eventNode;

      var data = patch.t;
      if (data) {
        data.B.t = domNode;
        var subPatches = data.x;
        if (subPatches.length > 0) {
          _VirtualDom_addDomNodesHelp(
            domNode,
            vNode,
            subPatches,
            0,
            low,
            high,
            eventNode,
          );
        }
      }
    } else {
      patch.u = domNode;
      patch.v = eventNode;
    }

    i++;

    if (!(patch = patches[i]) || (index = patch.s) > high) {
      return i;
    }
  }

  var tag = vNode.$;

  if (tag === 4) {
    var subNode = vNode.k;

    while (subNode.$ === 4) {
      subNode = subNode.k;
    }

    return _VirtualDom_addDomNodesHelp(
      domNode,
      subNode,
      patches,
      i,
      low + 1,
      high,
      domNode.gren_event_node_ref,
    );
  }

  // tag must be 1 or 2 at this point

  var vKids = vNode.e;
  var childNodes = domNode.childNodes;
  for (var j = 0; j < vKids.length; j++) {
    low++;
    var vKid = tag === 1 ? vKids[j] : vKids[j].node;
    var nextLow = low + (vKid.b || 0);
    if (low <= index && index <= nextLow) {
      i = _VirtualDom_addDomNodesHelp(
        childNodes[j],
        vKid,
        patches,
        i,
        low,
        nextLow,
        eventNode,
      );
      if (!(patch = patches[i]) || (index = patch.s) > high) {
        return i;
      }
    }
    low = nextLow;
  }
  return i;
}

// APPLY PATCHES

function _VirtualDom_applyPatches(
  rootDomNode,
  oldVirtualNode,
  patches,
  eventNode,
) {
  if (patches.length === 0) {
    return rootDomNode;
  }

  _VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
  return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches) {
  for (var i = 0; i < patches.length; i++) {
    var patch = patches[i];
    var localDomNode = patch.u;
    var newNode = _VirtualDom_applyPatch(localDomNode, patch);
    if (localDomNode === rootDomNode) {
      rootDomNode = newNode;
    }
  }
  return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch) {
  switch (patch.$) {
    case 0:
      return _VirtualDom_applyPatchRedraw(
        domNode,
        patch.t,
        patch.v,
      );

    case 4:
      _VirtualDom_applyFacts(domNode, patch.v, patch.t);
      return domNode;

    case 3:
      domNode.replaceData(0, domNode.length, patch.t);
      return domNode;

    case 1:
      return _VirtualDom_applyPatchesHelp(domNode, patch.t);

    case 2:
      if (domNode.gren_event_node_ref) {
        domNode.gren_event_node_ref.j = patch.t;
      } else {
        domNode.gren_event_node_ref = {
          j: patch.t,
          q: patch.v,
        };
      }
      return domNode;

    case 6:
      var data = patch.t;
      for (var i = 0; i < data.i; i++) {
        domNode.removeChild(domNode.childNodes[data.w]);
      }
      return domNode;

    case 7:
      var data = patch.t;
      var kids = data.e;
      var i = data.w;
      var theEnd = domNode.childNodes[i];
      for (; i < kids.length; i++) {
        domNode.insertBefore(
          _VirtualDom_render(kids[i], patch.v),
          theEnd,
        );
      }
      return domNode;

    case 9:
      var data = patch.t;
      if (!data) {
        domNode.parentNode.removeChild(domNode);
        return domNode;
      }
      var entry = data.B;
      if (typeof entry.s !== "undefined") {
        domNode.parentNode.removeChild(domNode);
      }
      entry.t = _VirtualDom_applyPatchesHelp(domNode, data.x);
      return domNode;

    case 8:
      return _VirtualDom_applyPatchReorder(domNode, patch);

    case 5:
      return patch.t(domNode);

    default:
      _Debug_crash(10); // 'Ran into an unknown patch!'
  }
}

function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode) {
  var parentNode = domNode.parentNode;
  var newNode = _VirtualDom_render(vNode, eventNode);

  if (!newNode.gren_event_node_ref) {
    newNode.gren_event_node_ref = domNode.gren_event_node_ref;
  }

  if (parentNode && newNode !== domNode) {
    parentNode.replaceChild(newNode, domNode);
  }
  return newNode;
}

function _VirtualDom_applyPatchReorder(domNode, patch) {
  var data = patch.t;

  // remove end inserts
  var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(
    data.z,
    patch,
  );

  // removals
  domNode = _VirtualDom_applyPatchesHelp(domNode, data.x);

  // inserts
  var inserts = data.y;
  for (var i = 0; i < inserts.length; i++) {
    var insert = inserts[i];
    var entry = insert.B;
    var node =
      entry.c === 2
        ? entry.t
        : _VirtualDom_render(entry.A, patch.v);
    domNode.insertBefore(node, domNode.childNodes[insert.s]);
  }

  // add end inserts
  if (frag) {
    _VirtualDom_appendChild(domNode, frag);
  }

  return domNode;
}

function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch) {
  if (!endInserts) {
    return;
  }

  var frag = _VirtualDom_doc.createDocumentFragment();
  for (var i = 0; i < endInserts.length; i++) {
    var insert = endInserts[i];
    var entry = insert.B;
    _VirtualDom_appendChild(
      frag,
      entry.c === 2
        ? entry.t
        : _VirtualDom_render(entry.A, patch.v),
    );
  }
  return frag;
}

function _VirtualDom_virtualize(node) {
  // TEXT NODES

  if (node.nodeType === 3) {
    return _VirtualDom_text(node.textContent);
  }

  // WEIRD NODES

  if (node.nodeType !== 1) {
    return _VirtualDom_text("");
  }

  // ELEMENT NODES

  var attrs = node.attributes;
  var attrList = new Array(attrs.length);

  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i];
    var name = attr.name;
    var value = attr.value;
    attrList[i] = A2(_VirtualDom_attribute, name, value);
  }

  var tag = node.tagName.toLowerCase();
  var kids = node.childNodes;
  var kidList = new Array(kids.length);

  for (var i = 0; i < kids.length; i++) {
    kidList[i] = _VirtualDom_virtualize(kids[i]);
  }

  return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode) {
  var keyedKids = keyedNode.e;
  var len = keyedKids.length;
  var kids = new Array(len);

  for (var i = 0; i < len; i++) {
    kids[i] = keyedKids[i].node;
  }

  return {
    $: 1,
    c: keyedNode.c,
    d: keyedNode.d,
    e: kids,
    f: keyedNode.f,
    b: keyedNode.b,
  };
}
var $gren_lang$core$Json$Decode$map = _Json_map1;
var $gren_lang$core$Json$Decode$map2 = _Json_map2;
var $gren_lang$core$Json$Decode$succeed = _Json_succeed;
var $gren_lang$browser$VirtualDom$toHandlerInt = function(handler) {
	switch (handler.$) {
		case 'Normal':
			return 0;
		case 'MayStopPropagation':
			return 1;
		case 'MayPreventDefault':
			return 2;
		default:
			return 3;
	}
};
var $gren_lang$browser$Browser$External = function (a) {
	return { $: 'External', a: a };
};
var $gren_lang$browser$Browser$Internal = function (a) {
	return { $: 'Internal', a: a };
};
var $gren_lang$core$Basics$identity = function(x) {
	return x;
};
var $gren_lang$browser$Browser$Dom$NotFound = function (a) {
	return { $: 'NotFound', a: a };
};
var $gren_lang$url$Url$Http = { $: 'Http' };
var $gren_lang$url$Url$Https = { $: 'Https' };
var $gren_lang$core$Basics$apL$ = function(f, x) {
	return f(x);
};
var $gren_lang$core$Basics$apL = F2($gren_lang$core$Basics$apL$);
var $gren_lang$core$String$contains = _String_contains;
var $gren_lang$core$Basics$lt = _Utils_lt;
var $gren_lang$core$String$slice = _String_slice;
var $gren_lang$core$String$unitLength = _String_unitLength;
var $gren_lang$core$String$dropFirst$ = function(n, string) {
	return (n < 1) ? string : A3($gren_lang$core$String$slice, n, $gren_lang$core$String$unitLength(string), string);
};
var $gren_lang$core$String$dropFirst = F2($gren_lang$core$String$dropFirst$);
var $gren_lang$core$String$indices = _String_indexes;
var $gren_lang$core$Basics$eq = _Utils_equal;
var $gren_lang$core$String$isEmpty = function(string) {
	return string === '';
};
var $gren_lang$core$String$takeFirst$ = function(n, string) {
	return (n < 1) ? '' : A3($gren_lang$core$String$slice, 0, n, string);
};
var $gren_lang$core$String$takeFirst = F2($gren_lang$core$String$takeFirst$);
var $gren_lang$core$String$toInt = _String_toInt;
var $gren_lang$url$Url$chompBeforePath$ = function(protocol, path, params, frag, str) {
	if ($gren_lang$core$String$isEmpty(str) || A2($gren_lang$core$String$contains, '@', str)) {
		return $gren_lang$core$Maybe$Nothing;
	} else {
		var _v0 = A2($gren_lang$core$String$indices, ':', str);
		switch (_v0.length) {
			case 0:
				return $gren_lang$core$Maybe$Just({ fragment: frag, host: str, path: path, port_: $gren_lang$core$Maybe$Nothing, protocol: protocol, query: params });
			case 1:
				var i = _v0[0];
				var _v1 = $gren_lang$core$String$toInt($gren_lang$core$String$dropFirst$(i + 1, str));
				if (_v1.$ === 'Nothing') {
					return $gren_lang$core$Maybe$Nothing;
				} else {
					var port_ = _v1;
					return $gren_lang$core$Maybe$Just({ fragment: frag, host: $gren_lang$core$String$takeFirst$(i, str), path: path, port_: port_, protocol: protocol, query: params });
				}
			default:
				return $gren_lang$core$Maybe$Nothing;
		}
	}
};
var $gren_lang$url$Url$chompBeforePath = F5($gren_lang$url$Url$chompBeforePath$);
var $gren_lang$core$Array$get = _Array_get;
var $gren_lang$url$Url$chompBeforeQuery$ = function(protocol, params, frag, str) {
	if ($gren_lang$core$String$isEmpty(str)) {
		return $gren_lang$core$Maybe$Nothing;
	} else {
		var _v0 = A2($gren_lang$core$Array$get, 0, A2($gren_lang$core$String$indices, '/', str));
		if (_v0.$ === 'Nothing') {
			return $gren_lang$url$Url$chompBeforePath$(protocol, '/', params, frag, str);
		} else {
			var i = _v0.a;
			return $gren_lang$url$Url$chompBeforePath$(protocol, $gren_lang$core$String$dropFirst$(i, str), params, frag, $gren_lang$core$String$takeFirst$(i, str));
		}
	}
};
var $gren_lang$url$Url$chompBeforeQuery = F4($gren_lang$url$Url$chompBeforeQuery$);
var $gren_lang$url$Url$chompBeforeFragment$ = function(protocol, frag, str) {
	if ($gren_lang$core$String$isEmpty(str)) {
		return $gren_lang$core$Maybe$Nothing;
	} else {
		var _v0 = A2($gren_lang$core$Array$get, 0, A2($gren_lang$core$String$indices, '?', str));
		if (_v0.$ === 'Nothing') {
			return $gren_lang$url$Url$chompBeforeQuery$(protocol, $gren_lang$core$Maybe$Nothing, frag, str);
		} else {
			var i = _v0.a;
			return $gren_lang$url$Url$chompBeforeQuery$(protocol, $gren_lang$core$Maybe$Just($gren_lang$core$String$dropFirst$(i + 1, str)), frag, $gren_lang$core$String$takeFirst$(i, str));
		}
	}
};
var $gren_lang$url$Url$chompBeforeFragment = F3($gren_lang$url$Url$chompBeforeFragment$);
var $gren_lang$url$Url$chompAfterProtocol$ = function(protocol, str) {
	if ($gren_lang$core$String$isEmpty(str)) {
		return $gren_lang$core$Maybe$Nothing;
	} else {
		var _v0 = A2($gren_lang$core$Array$get, 0, A2($gren_lang$core$String$indices, '#', str));
		if (_v0.$ === 'Nothing') {
			return $gren_lang$url$Url$chompBeforeFragment$(protocol, $gren_lang$core$Maybe$Nothing, str);
		} else {
			var i = _v0.a;
			return $gren_lang$url$Url$chompBeforeFragment$(protocol, $gren_lang$core$Maybe$Just($gren_lang$core$String$dropFirst$(i + 1, str)), $gren_lang$core$String$takeFirst$(i, str));
		}
	}
};
var $gren_lang$url$Url$chompAfterProtocol = F2($gren_lang$url$Url$chompAfterProtocol$);
var $gren_lang$core$String$unitStartsWithFrom = _String_startsWith;
var $gren_lang$core$String$startsWith$ = function(sub, str) {
	return A3($gren_lang$core$String$unitStartsWithFrom, 0, sub, str);
};
var $gren_lang$core$String$startsWith = F2($gren_lang$core$String$startsWith$);
var $gren_lang$url$Url$fromString = function(str) {
	return $gren_lang$core$String$startsWith$('http://', str) ? $gren_lang$url$Url$chompAfterProtocol$($gren_lang$url$Url$Http, $gren_lang$core$String$dropFirst$(7, str)) : ($gren_lang$core$String$startsWith$('https://', str) ? $gren_lang$url$Url$chompAfterProtocol$($gren_lang$url$Url$Https, $gren_lang$core$String$dropFirst$(8, str)) : $gren_lang$core$Maybe$Nothing);
};
var $gren_lang$core$Basics$never = function(_v0) {
	never:
	while (true) {
		var nvr = _v0.a;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $gren_lang$core$Task$Perform = function (a) {
	return { $: 'Perform', a: a };
};
var $gren_lang$core$Task$succeed = _Scheduler_succeed;
var $gren_lang$core$Task$init = $gren_lang$core$Task$succeed({  });
var $gren_lang$core$Array$map = _Array_map;
var $gren_lang$core$Task$andThen = _Scheduler_andThen;
var $gren_lang$core$Basics$apR$ = function(x, f) {
	return f(x);
};
var $gren_lang$core$Basics$apR = F2($gren_lang$core$Basics$apR$);
var $gren_lang$core$Task$map$ = function(func, taskA) {
	return A2($gren_lang$core$Task$andThen, function(a) {
			return $gren_lang$core$Task$succeed(func(a));
		}, taskA);
};
var $gren_lang$core$Task$map = F2($gren_lang$core$Task$map$);
var $gren_lang$core$Basics$gt = _Utils_gt;
var $gren_lang$core$Basics$clamp$ = function(low, high, number) {
	return (_Utils_cmp(number, low) < 0) ? low : ((_Utils_cmp(number, high) > 0) ? high : number);
};
var $gren_lang$core$Basics$clamp = F3($gren_lang$core$Basics$clamp$);
var $gren_lang$core$Basics$pow = _Basics_pow;
var $gren_lang$core$Basics$sub = _Basics_sub;
var $gren_lang$core$Array$maxLength = A2($gren_lang$core$Basics$pow, 2, 32) - 1;
var $gren_lang$core$Array$Builder$empty = function(capacity) {
	var clampedCapacity = $gren_lang$core$Basics$clamp$(0, $gren_lang$core$Array$maxLength, capacity);
	return _Array_emptyBuilder(clampedCapacity);
};
var $gren_lang$core$Array$foldl = _Array_foldl;
var $gren_lang$core$Array$Builder$pushLast = _Array_pushToBuilder;
var $gren_lang$core$Array$Builder$toArray = _Array_fromBuilder;
var $gren_lang$core$Task$sequence = function(taskArray) {
	return $gren_lang$core$Task$map$($gren_lang$core$Array$Builder$toArray, A3($gren_lang$core$Array$foldl, F2(function(task, combined) {
					return A2($gren_lang$core$Task$andThen, function(acc) {
							return $gren_lang$core$Task$map$(function(v) {
									return A2($gren_lang$core$Array$Builder$pushLast, v, acc);
								}, task);
						}, combined);
				}), $gren_lang$core$Task$succeed($gren_lang$core$Array$Builder$empty($gren_lang$core$Array$length(taskArray))), taskArray));
};
var $gren_lang$core$Platform$sendToApp = _Platform_sendToApp;
var $gren_lang$core$Task$spawnCmd$ = function(router, cmd) {
	switch (cmd.$) {
		case 'Perform':
			var task = cmd.a;
			return _Scheduler_spawn(A2($gren_lang$core$Task$andThen, $gren_lang$core$Platform$sendToApp(router), task));
		case 'ExecuteCmd':
			var task = cmd.a;
			return _Scheduler_spawn(A2($gren_lang$core$Task$andThen, _Platform_executeCmd(router), task));
		default:
			var task = cmd.a;
			return _Scheduler_spawn(task);
	}
};
var $gren_lang$core$Task$spawnCmd = F2($gren_lang$core$Task$spawnCmd$);
var $gren_lang$core$Task$onEffects$ = function(router, commands, state) {
	return $gren_lang$core$Task$map$(function(_v0) {
			return {  };
		}, $gren_lang$core$Task$sequence(A2($gren_lang$core$Array$map, $gren_lang$core$Task$spawnCmd(router), commands)));
};
var $gren_lang$core$Task$onEffects = F3($gren_lang$core$Task$onEffects$);
var $gren_lang$core$Task$onSelfMsg$ = function(_v0, _v1, _v2) {
	return $gren_lang$core$Task$succeed({  });
};
var $gren_lang$core$Task$onSelfMsg = F3($gren_lang$core$Task$onSelfMsg$);
var $gren_lang$core$Task$Execute = function (a) {
	return { $: 'Execute', a: a };
};
var $gren_lang$core$Task$ExecuteCmd = function (a) {
	return { $: 'ExecuteCmd', a: a };
};
var $gren_lang$core$Platform$Cmd$map = _Platform_map;
var $gren_lang$core$Task$cmdMap$ = function(tagger, cmd) {
	switch (cmd.$) {
		case 'Perform':
			var task = cmd.a;
			return $gren_lang$core$Task$Perform($gren_lang$core$Task$map$(tagger, task));
		case 'ExecuteCmd':
			var task = cmd.a;
			return $gren_lang$core$Task$ExecuteCmd($gren_lang$core$Task$map$($gren_lang$core$Platform$Cmd$map(tagger), task));
		default:
			var task = cmd.a;
			return $gren_lang$core$Task$Execute(task);
	}
};
var $gren_lang$core$Task$cmdMap = F2($gren_lang$core$Task$cmdMap$);
_Platform_effectManagers['Task'] = _Platform_createManager($gren_lang$core$Task$init, $gren_lang$core$Task$onEffects, $gren_lang$core$Task$onSelfMsg, $gren_lang$core$Task$cmdMap);
var $gren_lang$core$Task$command = _Platform_leaf('Task');
var $gren_lang$core$Task$perform$ = function(toMessage, task) {
	return $gren_lang$core$Task$command($gren_lang$core$Task$Perform($gren_lang$core$Task$map$(toMessage, task)));
};
var $gren_lang$core$Task$perform = F2($gren_lang$core$Task$perform$);
var $gren_lang$browser$Browser$application = _Browser_application;
var $gren_lang$core$Json$Decode$bool = _Json_decodeBool;
var $gren_lang$core$Json$Decode$field = _Json_decodeField;
var $author$project$Root$CatalogMsg = function (a) {
	return { $: 'CatalogMsg', a: a };
};
var $author$project$Root$Home = { $: 'Home' };
var $author$project$Catalog$Catalog$Loaded = function (a) {
	return { $: 'Loaded', a: a };
};
var $author$project$Catalog$Catalog$Loading = { $: 'Loading' };
var $gren_lang$core$Task$onError = _Scheduler_onError;
var $gren_lang$core$Task$attempt$ = function(resultToMessage, task) {
	return $gren_lang$core$Task$command($gren_lang$core$Task$Perform(A2($gren_lang$core$Task$onError, $gren_lang$core$Basics$composeL$($gren_lang$core$Basics$composeL$($gren_lang$core$Task$succeed, resultToMessage), $gren_lang$core$Result$Err), A2($gren_lang$core$Task$andThen, $gren_lang$core$Basics$composeL$($gren_lang$core$Basics$composeL$($gren_lang$core$Task$succeed, resultToMessage), $gren_lang$core$Result$Ok), task))));
};
var $gren_lang$core$Task$attempt = F2($gren_lang$core$Task$attempt$);
var $gren_lang$core$Json$Decode$array = _Json_decodeArray;
var $author$project$Shared$Grade$countTechniques = function(data) {
	return $gren_lang$core$Dict$foldl$(F3(function(_v0, attacks, total) {
				return A3($gren_lang$core$Array$foldl, F2(function(attack, sum) {
							return sum + $gren_lang$core$Array$length(attack.techniques);
						}), total, attacks);
			}), 0, data);
};
var $gren_lang$core$Dict$RBEmpty_gren_builtin = { $: 'RBEmpty_gren_builtin' };
var $gren_lang$core$Dict$empty = $gren_lang$core$Dict$RBEmpty_gren_builtin;
var $gren_lang$core$Array$findFirst = _Array_findFirst;
var $gren_lang$core$Maybe$map$ = function(f, maybe) {
	if (maybe.$ === 'Just') {
		var value = maybe.a;
		return $gren_lang$core$Maybe$Just(f(value));
	} else {
		return $gren_lang$core$Maybe$Nothing;
	}
};
var $gren_lang$core$Maybe$map = F2($gren_lang$core$Maybe$map$);
var $gren_lang$core$Array$mapAndFlatten = _Array_flatMap;
var $gren_lang$core$Array$mapAndKeepJust$ = function(mapper, array) {
	return A2($gren_lang$core$Array$mapAndFlatten, function(v) {
			var _v0 = mapper(v);
			if (_v0.$ === 'Just') {
				var newValue = _v0.a;
				return [ newValue ];
			} else {
				return [  ];
			}
		}, array);
};
var $gren_lang$core$Array$mapAndKeepJust = F2($gren_lang$core$Array$mapAndKeepJust$);
var $gren_lang$core$Basics$compare = _Utils_compare;
var $gren_lang$core$Dict$get$ = function(targetKey, dict) {
	get:
	while (true) {
		if (dict.$ === 'RBEmpty_gren_builtin') {
			return $gren_lang$core$Maybe$Nothing;
		} else {
			var _v1 = dict.a;
			var key = _v1.key;
			var value = _v1.value;
			var left = _v1.left;
			var right = _v1.right;
			var _v2 = A2($gren_lang$core$Basics$compare, targetKey, key);
			switch (_v2.$) {
				case 'LT':
					var $temp$targetKey = targetKey,
					$temp$dict = left;
					targetKey = $temp$targetKey;
					dict = $temp$dict;
					continue get;
				case 'EQ':
					return $gren_lang$core$Maybe$Just(value);
				default:
					var $temp$targetKey = targetKey,
					$temp$dict = right;
					targetKey = $temp$targetKey;
					dict = $temp$dict;
					continue get;
			}
		}
	}
};
var $gren_lang$core$Dict$get = F2($gren_lang$core$Dict$get$);
var $author$project$Shared$Grade$defaultOrder = 42;
var $author$project$Shared$Grade$found$ = function(predicate, array) {
	return $gren_lang$core$Maybe$map$(function ($) {
			return $.value;
		}, A2($gren_lang$core$Array$findFirst, predicate, array));
};
var $author$project$Shared$Grade$found = F2($author$project$Shared$Grade$found$);
var $gren_lang$core$Maybe$withDefault$ = function(_default, maybe) {
	if (maybe.$ === 'Just') {
		var value = maybe.a;
		return value;
	} else {
		return _default;
	}
};
var $gren_lang$core$Maybe$withDefault = F2($gren_lang$core$Maybe$withDefault$);
var $author$project$Shared$Grade$applyPatch$ = function(base, patch) {
	return { forms: $gren_lang$core$Maybe$withDefault$(base.forms, patch.forms), isNew: $gren_lang$core$Maybe$withDefault$(base.isNew, patch.isNew), isWarning: $gren_lang$core$Maybe$withDefault$(base.isWarning, patch.isWarning), name: patch.name, note: $gren_lang$core$Maybe$withDefault$(base.note, patch.note), order: $gren_lang$core$Maybe$withDefault$(base.order, patch.order), video: $gren_lang$core$Maybe$withDefault$(base.video, patch.video) };
};
var $author$project$Shared$Grade$applyPatch = F2($author$project$Shared$Grade$applyPatch$);
var $author$project$Shared$Grade$defaultTechnique = { forms: [  ], isNew: false, isWarning: false, name: '', note: $gren_lang$core$Maybe$Nothing, order: $author$project$Shared$Grade$defaultOrder, video: $gren_lang$core$Maybe$Nothing };
var $author$project$Shared$Grade$mergeTechnique$ = function(patch, techniques) {
	var _v0 = $author$project$Shared$Grade$found$(function(technique) {
			return _Utils_eq(technique.name, patch.name);
		}, techniques);
	if (_v0.$ === 'Nothing') {
		return $gren_lang$core$Array$pushLast$($author$project$Shared$Grade$applyPatch$($author$project$Shared$Grade$defaultTechnique, patch), techniques);
	} else {
		var known = _v0.a;
		return A2($gren_lang$core$Array$map, function(technique) {
				return _Utils_eq(technique.name, patch.name) ? $author$project$Shared$Grade$applyPatch$(known, patch) : technique;
			}, techniques);
	}
};
var $author$project$Shared$Grade$mergeTechnique = F2($author$project$Shared$Grade$mergeTechnique$);
var $author$project$Shared$Grade$mergeAttack$ = function(patch, attacks) {
	var _v0 = $author$project$Shared$Grade$found$(function(attack) {
			return _Utils_eq(attack.name, patch.name);
		}, attacks);
	if (_v0.$ === 'Nothing') {
		return $gren_lang$core$Array$pushLast$({ name: patch.name, order: $gren_lang$core$Maybe$withDefault$($author$project$Shared$Grade$defaultOrder, patch.order), techniques: A3($gren_lang$core$Array$foldl, $author$project$Shared$Grade$mergeTechnique, [  ], patch.techniques) }, attacks);
	} else {
		var known = _v0.a;
		var merged = { name: known.name, order: $gren_lang$core$Maybe$withDefault$(known.order, patch.order), techniques: A3($gren_lang$core$Array$foldl, $author$project$Shared$Grade$mergeTechnique, known.techniques, patch.techniques) };
		return A2($gren_lang$core$Array$map, function(attack) {
				return _Utils_eq(attack.name, patch.name) ? merged : attack;
			}, attacks);
	}
};
var $author$project$Shared$Grade$mergeAttack = F2($author$project$Shared$Grade$mergeAttack$);
var $gren_lang$core$Dict$Black = { $: 'Black' };
var $gren_lang$core$Dict$RBNode_gren_builtin = function (a) {
	return { $: 'RBNode_gren_builtin', a: a };
};
var $gren_lang$core$Dict$node$ = function(color, key, value, left, right) {
	return $gren_lang$core$Dict$RBNode_gren_builtin({ color: color, key: key, left: left, right: right, value: value });
};
var $gren_lang$core$Dict$node = F5($gren_lang$core$Dict$node$);
var $gren_lang$core$Dict$Red = { $: 'Red' };
var $gren_lang$core$Dict$balance$ = function(color, key, value, left, right) {
	if ((right.$ === 'RBNode_gren_builtin') && (right.a.color.$ === 'Red')) {
		var _v1 = right.a;
		var _v2 = _v1.color;
		var rK = _v1.key;
		var rV = _v1.value;
		var rLeft = _v1.left;
		var rRight = _v1.right;
		if ((left.$ === 'RBNode_gren_builtin') && (left.a.color.$ === 'Red')) {
			var _v4 = left.a;
			var _v5 = _v4.color;
			var lK = _v4.key;
			var lV = _v4.value;
			var lLeft = _v4.left;
			var lRight = _v4.right;
			return $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, key, value, $gren_lang$core$Dict$node$($gren_lang$core$Dict$Black, lK, lV, lLeft, lRight), $gren_lang$core$Dict$node$($gren_lang$core$Dict$Black, rK, rV, rLeft, rRight));
		} else {
			return $gren_lang$core$Dict$node$(color, rK, rV, $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, key, value, left, rLeft), rRight);
		}
	} else {
		if ((((left.$ === 'RBNode_gren_builtin') && (left.a.color.$ === 'Red')) && (left.a.left.$ === 'RBNode_gren_builtin')) && (left.a.left.a.color.$ === 'Red')) {
			var _v7 = left.a;
			var _v8 = _v7.color;
			var lK = _v7.key;
			var lV = _v7.value;
			var _v9 = _v7.left.a;
			var _v10 = _v9.color;
			var llK = _v9.key;
			var llV = _v9.value;
			var llLeft = _v9.left;
			var llRight = _v9.right;
			var lRight = _v7.right;
			return $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, lK, lV, $gren_lang$core$Dict$node$($gren_lang$core$Dict$Black, llK, llV, llLeft, llRight), $gren_lang$core$Dict$node$($gren_lang$core$Dict$Black, key, value, lRight, right));
		} else {
			return $gren_lang$core$Dict$node$(color, key, value, left, right);
		}
	}
};
var $gren_lang$core$Dict$balance = F5($gren_lang$core$Dict$balance$);
var $gren_lang$core$Dict$setHelp$ = function(key, value, dict) {
	if (dict.$ === 'RBEmpty_gren_builtin') {
		return $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, key, value, $gren_lang$core$Dict$RBEmpty_gren_builtin, $gren_lang$core$Dict$RBEmpty_gren_builtin);
	} else {
		var _v1 = dict.a;
		var nColor = _v1.color;
		var nKey = _v1.key;
		var nValue = _v1.value;
		var nLeft = _v1.left;
		var nRight = _v1.right;
		var _v2 = A2($gren_lang$core$Basics$compare, key, nKey);
		switch (_v2.$) {
			case 'LT':
				return $gren_lang$core$Dict$balance$(nColor, nKey, nValue, $gren_lang$core$Dict$setHelp$(key, value, nLeft), nRight);
			case 'EQ':
				return $gren_lang$core$Dict$node$(nColor, nKey, value, nLeft, nRight);
			default:
				return $gren_lang$core$Dict$balance$(nColor, nKey, nValue, nLeft, $gren_lang$core$Dict$setHelp$(key, value, nRight));
		}
	}
};
var $gren_lang$core$Dict$setHelp = F3($gren_lang$core$Dict$setHelp$);
var $gren_lang$core$Dict$set$ = function(setKey, setValue, dict) {
	var _v0 = $gren_lang$core$Dict$setHelp$(setKey, setValue, dict);
	if ((_v0.$ === 'RBNode_gren_builtin') && (_v0.a.color.$ === 'Red')) {
		var _v1 = _v0.a;
		var _v2 = _v1.color;
		var key = _v1.key;
		var value = _v1.value;
		var left = _v1.left;
		var right = _v1.right;
		return $gren_lang$core$Dict$node$($gren_lang$core$Dict$Black, key, value, left, right);
	} else {
		var x = _v0;
		return x;
	}
};
var $gren_lang$core$Dict$set = F3($gren_lang$core$Dict$set$);
var $author$project$Shared$Grade$mergeFile$ = function(patch, base) {
	return $gren_lang$core$Dict$foldl$(F3(function(waza, attackPatches, data) {
				return $gren_lang$core$Dict$set$(waza, A3($gren_lang$core$Array$foldl, $author$project$Shared$Grade$mergeAttack, $gren_lang$core$Maybe$withDefault$([  ], $gren_lang$core$Dict$get$(waza, data)), attackPatches), data);
			}), base, patch);
};
var $author$project$Shared$Grade$mergeFile = F2($author$project$Shared$Grade$mergeFile$);
var $author$project$Catalog$Catalog$assemble$ = function(loaded, info) {
	var patchOf = function(file) {
		return $gren_lang$core$Maybe$map$(function(found) {
				return found.value.patch;
			}, A2($gren_lang$core$Array$findFirst, function(entry) {
					return _Utils_eq(entry.file, file);
				}, loaded));
	};
	var data = A3($gren_lang$core$Array$foldl, $author$project$Shared$Grade$mergeFile, $gren_lang$core$Dict$empty, $gren_lang$core$Array$mapAndKeepJust$(patchOf, $gren_lang$core$Array$pushLast$(info.file, info.includes)));
	return { count: $author$project$Shared$Grade$countTechniques(data), data: data, info: info };
};
var $author$project$Catalog$Catalog$assemble = F2($author$project$Catalog$Catalog$assemble$);
var $gren_lang$core$Json$Decode$decodeString = _Json_runOnString;


// SEND REQUEST

var _Http_toTask = F3(function (router, toTask, request) {
  return _Scheduler_binding(function (callback) {
    function done(response) {
      callback(toTask(request.expect.a(response)));
    }

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("error", function () {
      done($gren_lang$browser$Http$NetworkError_);
    });
    xhr.addEventListener("timeout", function () {
      done($gren_lang$browser$Http$Timeout_);
    });
    xhr.addEventListener("load", function () {
      done(_Http_toResponse(request.expect.b, xhr));
    });
    $gren_lang$core$Maybe$isJust(request.tracker) &&
      _Http_track(router, xhr, request.tracker.a);

    try {
      xhr.open(request.method, request.url, true);
    } catch (e) {
      return done($gren_lang$browser$Http$BadUrl_(request.url));
    }

    _Http_configureRequest(xhr, request);

    request.body.a &&
      xhr.setRequestHeader("Content-Type", request.body.a);
    xhr.send(request.body.b);

    return function () {
      xhr.c = true;
      xhr.abort();
    };
  });
});

// CONFIGURE

function _Http_configureRequest(xhr, request) {
  var headers = request.headers;
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i].a;
    xhr.setRequestHeader(header.key, header.value);
  }
  xhr.timeout = request.timeout.a || 0;
  xhr.responseType = request.expect.d;
  xhr.withCredentials = request.allowCookiesFromOtherDomains;
}

// RESPONSES

function _Http_toResponse(toBody, xhr) {
  var ctor =
    200 <= xhr.status && xhr.status < 300
      ? $gren_lang$browser$Http$GoodStatus_
      : $gren_lang$browser$Http$BadStatus_;

  return ctor({
    metadata: _Http_toMetadata(xhr),
    body: toBody(xhr.response),
  });
}

// METADATA

function _Http_toMetadata(xhr) {
  return {
    url: xhr.responseURL,
    statusCode: xhr.status,
    statusText: xhr.statusText,
    headers: _Http_parseHeaders(xhr.getAllResponseHeaders()),
  };
}

// HEADERS

function _Http_parseHeaders(rawHeaders) {
  if (!rawHeaders) {
    return $gren_lang$core$Dict$empty;
  }

  var headers = $gren_lang$core$Dict$empty;
  var headerPairs = rawHeaders.split("\r\n");
  for (var i = headerPairs.length; i--; ) {
    var headerPair = headerPairs[i];
    var index = headerPair.indexOf(": ");
    if (index > 0) {
      var key = headerPair.substring(0, index);
      var value = headerPair.substring(index + 2);

      headers = A3(
        $gren_lang$core$Dict$update,
        key,
        function (oldValue) {
          return $gren_lang$core$Maybe$Just(
            $gren_lang$core$Maybe$isJust(oldValue) ? value + ", " + oldValue.a : value,
          );
        },
        headers,
      );
    }
  }
  return headers;
}

// EXPECT

var _Http_expect = F3(function (type, toBody, toValue) {
  return {
    $: 0,
    d: type,
    b: toBody,
    a: toValue,
  };
});

var _Http_mapExpect = F2(function (func, expect) {
  return {
    $: 0,
    d: expect.d,
    b: expect.b,
    a: function (x) {
      return func(expect.a(x));
    },
  };
});

function _Http_toDataView(arrayBuffer) {
  return new DataView(arrayBuffer);
}

// BODY and PARTS

var _Http_emptyBody = { $: 0 };
var _Http_pair = F2(function (a, b) {
  return { $: 0, a: a, b: b };
});

function _Http_toFormData(parts) {
  var formData = new FormData();
  for (var i = 0; i < parts.length; i++) {
    formData.append(parts[i].a, parts[i].b);
  }
  return formData;
}

var _Http_bytesToBlob = F2(function (mime, bytes) {
  return new Blob([bytes], { type: mime });
});

// PROGRESS

function _Http_track(router, xhr, tracker) {
  // TODO check out lengthComputable on loadstart event

  xhr.upload.addEventListener("progress", function (event) {
    if (xhr.c) {
      return;
    }
    _Scheduler_rawSpawn(
      A2($gren_lang$core$Platform$sendToSelf, router, {
        tracker: tracker,
        progress: $gren_lang$browser$Http$Sending({
          sent: event.loaded,
          size: event.total,
        }),
      }),
    );
  });
  xhr.addEventListener("progress", function (event) {
    if (xhr.c) {
      return;
    }
    _Scheduler_rawSpawn(
      A2($gren_lang$core$Platform$sendToSelf, router, {
        tracker: tracker,
        progress: $gren_lang$browser$Http$Receiving({
          received: event.loaded,
          size: event.lengthComputable
            ? $gren_lang$core$Maybe$Just(event.total)
            : $gren_lang$core$Maybe$Nothing,
        }),
      }),
    );
  });
}
var $gren_lang$browser$Http$BadStatus_ = function (a) {
	return { $: 'BadStatus_', a: a };
};
var $gren_lang$browser$Http$BadUrl_ = function (a) {
	return { $: 'BadUrl_', a: a };
};
var $gren_lang$browser$Http$GoodStatus_ = function (a) {
	return { $: 'GoodStatus_', a: a };
};
var $gren_lang$browser$Http$NetworkError_ = { $: 'NetworkError_' };
var $gren_lang$browser$Http$Receiving = function (a) {
	return { $: 'Receiving', a: a };
};
var $gren_lang$browser$Http$Sending = function (a) {
	return { $: 'Sending', a: a };
};
var $gren_lang$browser$Http$Timeout_ = { $: 'Timeout_' };
var $gren_lang$core$Maybe$isJust = function(maybe) {
	if (maybe.$ === 'Just') {
		return true;
	} else {
		return false;
	}
};
var $gren_lang$core$Platform$sendToSelf = _Platform_sendToSelf;
var $gren_lang$core$Dict$getMin = function(dict) {
	getMin:
	while (true) {
		if ((dict.$ === 'RBNode_gren_builtin') && (dict.a.left.$ === 'RBNode_gren_builtin')) {
			var left = dict.a.left;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $gren_lang$core$Dict$moveRedLeft = function(dict) {
	if (((dict.$ === 'RBNode_gren_builtin') && (dict.a.left.$ === 'RBNode_gren_builtin')) && (dict.a.right.$ === 'RBNode_gren_builtin')) {
		if ((dict.a.right.a.left.$ === 'RBNode_gren_builtin') && (dict.a.right.a.left.a.color.$ === 'Red')) {
			var _v1 = dict.a;
			var clr = _v1.color;
			var k = _v1.key;
			var v = _v1.value;
			var _v2 = _v1.left.a;
			var lClr = _v2.color;
			var lK = _v2.key;
			var lV = _v2.value;
			var lLeft = _v2.left;
			var lRight = _v2.right;
			var _v3 = _v1.right.a;
			var rClr = _v3.color;
			var rK = _v3.key;
			var rV = _v3.value;
			var rLeft = _v3.left;
			var _v4 = rLeft.a;
			var _v5 = _v4.color;
			var rlK = _v4.key;
			var rlV = _v4.value;
			var rlL = _v4.left;
			var rlR = _v4.right;
			var rRight = _v3.right;
			return $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, rlK, rlV, $gren_lang$core$Dict$node$($gren_lang$core$Dict$Black, k, v, $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, lK, lV, lLeft, lRight), rlL), $gren_lang$core$Dict$node$($gren_lang$core$Dict$Black, rK, rV, rlR, rRight));
		} else {
			var _v6 = dict.a;
			var clr = _v6.color;
			var k = _v6.key;
			var v = _v6.value;
			var _v7 = _v6.left.a;
			var lClr = _v7.color;
			var lK = _v7.key;
			var lV = _v7.value;
			var lLeft = _v7.left;
			var lRight = _v7.right;
			var _v8 = _v6.right.a;
			var rClr = _v8.color;
			var rK = _v8.key;
			var rV = _v8.value;
			var rLeft = _v8.left;
			var rRight = _v8.right;
			return $gren_lang$core$Dict$node$($gren_lang$core$Dict$Black, k, v, $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, lK, lV, lLeft, lRight), $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, rK, rV, rLeft, rRight));
		}
	} else {
		return dict;
	}
};
var $gren_lang$core$Dict$moveRedRight = function(dict) {
	if (((dict.$ === 'RBNode_gren_builtin') && (dict.a.left.$ === 'RBNode_gren_builtin')) && (dict.a.right.$ === 'RBNode_gren_builtin')) {
		if ((dict.a.left.a.left.$ === 'RBNode_gren_builtin') && (dict.a.left.a.left.a.color.$ === 'Red')) {
			var _v1 = dict.a;
			var clr = _v1.color;
			var k = _v1.key;
			var v = _v1.value;
			var _v2 = _v1.left.a;
			var lClr = _v2.color;
			var lK = _v2.key;
			var lV = _v2.value;
			var _v3 = _v2.left.a;
			var _v4 = _v3.color;
			var llK = _v3.key;
			var llV = _v3.value;
			var llLeft = _v3.left;
			var llRight = _v3.right;
			var lRight = _v2.right;
			var _v5 = _v1.right.a;
			var rClr = _v5.color;
			var rK = _v5.key;
			var rV = _v5.value;
			var rLeft = _v5.left;
			var rRight = _v5.right;
			return $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, lK, lV, $gren_lang$core$Dict$node$($gren_lang$core$Dict$Black, llK, llV, llLeft, llRight), $gren_lang$core$Dict$node$($gren_lang$core$Dict$Black, k, v, lRight, $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, rK, rV, rLeft, rRight)));
		} else {
			var _v6 = dict.a;
			var clr = _v6.color;
			var k = _v6.key;
			var v = _v6.value;
			var _v7 = _v6.left.a;
			var lClr = _v7.color;
			var lK = _v7.key;
			var lV = _v7.value;
			var lLeft = _v7.left;
			var lRight = _v7.right;
			var _v8 = _v6.right.a;
			var rClr = _v8.color;
			var rK = _v8.key;
			var rV = _v8.value;
			var rLeft = _v8.left;
			var rRight = _v8.right;
			return $gren_lang$core$Dict$node$($gren_lang$core$Dict$Black, k, v, $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, lK, lV, lLeft, lRight), $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, rK, rV, rLeft, rRight));
		}
	} else {
		return dict;
	}
};
var $gren_lang$core$Dict$removeHelpPrepEQGT$ = function(targetKey, dict, color, key, value, left, right) {
	if ((left.$ === 'RBNode_gren_builtin') && (left.a.color.$ === 'Red')) {
		var _v1 = left.a;
		var _v2 = _v1.color;
		var lK = _v1.key;
		var lV = _v1.value;
		var lLeft = _v1.left;
		var lRight = _v1.right;
		return $gren_lang$core$Dict$node$(color, lK, lV, lLeft, $gren_lang$core$Dict$node$($gren_lang$core$Dict$Red, key, value, lRight, right));
	} else {
		_v3$2:
		while (true) {
			if ((right.$ === 'RBNode_gren_builtin') && (right.a.color.$ === 'Black')) {
				if (right.a.left.$ === 'RBNode_gren_builtin') {
					if (right.a.left.a.color.$ === 'Black') {
						var _v4 = right.a;
						var _v5 = _v4.color;
						var _v6 = _v4.left.a.color;
						return $gren_lang$core$Dict$moveRedRight(dict);
					} else {
						break _v3$2;
					}
				} else {
					var _v7 = right.a;
					var _v8 = _v7.color;
					var _v9 = _v7.left;
					return $gren_lang$core$Dict$moveRedRight(dict);
				}
			} else {
				break _v3$2;
			}
		}
		return dict;
	}
};
var $gren_lang$core$Dict$removeHelpPrepEQGT = F7($gren_lang$core$Dict$removeHelpPrepEQGT$);
var $gren_lang$core$Dict$removeMin = function(dict) {
	if ((dict.$ === 'RBNode_gren_builtin') && (dict.a.left.$ === 'RBNode_gren_builtin')) {
		var _v1 = dict.a;
		var color = _v1.color;
		var key = _v1.key;
		var value = _v1.value;
		var left = _v1.left;
		var _v2 = left.a;
		var lColor = _v2.color;
		var lLeft = _v2.left;
		var right = _v1.right;
		if (lColor.$ === 'Black') {
			if ((lLeft.$ === 'RBNode_gren_builtin') && (lLeft.a.color.$ === 'Red')) {
				var _v5 = lLeft.a.color;
				return $gren_lang$core$Dict$node$(color, key, value, $gren_lang$core$Dict$removeMin(left), right);
			} else {
				var _v6 = $gren_lang$core$Dict$moveRedLeft(dict);
				if (_v6.$ === 'RBNode_gren_builtin') {
					var _v7 = _v6.a;
					var nColor = _v7.color;
					var nKey = _v7.key;
					var nValue = _v7.value;
					var nLeft = _v7.left;
					var nRight = _v7.right;
					return $gren_lang$core$Dict$balance$(nColor, nKey, nValue, $gren_lang$core$Dict$removeMin(nLeft), nRight);
				} else {
					return $gren_lang$core$Dict$RBEmpty_gren_builtin;
				}
			}
		} else {
			return $gren_lang$core$Dict$node$(color, key, value, $gren_lang$core$Dict$removeMin(left), right);
		}
	} else {
		return $gren_lang$core$Dict$RBEmpty_gren_builtin;
	}
};
var $gren_lang$core$Dict$removeHelp$ = function(targetKey, dict) {
	if (dict.$ === 'RBEmpty_gren_builtin') {
		return $gren_lang$core$Dict$RBEmpty_gren_builtin;
	} else {
		var _v5 = dict.a;
		var color = _v5.color;
		var key = _v5.key;
		var value = _v5.value;
		var left = _v5.left;
		var right = _v5.right;
		if (_Utils_cmp(targetKey, key) < 0) {
			if ((left.$ === 'RBNode_gren_builtin') && (left.a.color.$ === 'Black')) {
				var _v7 = left.a;
				var _v8 = _v7.color;
				var lLeft = _v7.left;
				if ((lLeft.$ === 'RBNode_gren_builtin') && (lLeft.a.color.$ === 'Red')) {
					var _v10 = lLeft.a.color;
					return $gren_lang$core$Dict$node$(color, key, value, $gren_lang$core$Dict$removeHelp$(targetKey, left), right);
				} else {
					var _v11 = $gren_lang$core$Dict$moveRedLeft(dict);
					if (_v11.$ === 'RBNode_gren_builtin') {
						var _v12 = _v11.a;
						var nColor = _v12.color;
						var nKey = _v12.key;
						var nValue = _v12.value;
						var nLeft = _v12.left;
						var nRight = _v12.right;
						return $gren_lang$core$Dict$balance$(nColor, nKey, nValue, $gren_lang$core$Dict$removeHelp$(targetKey, nLeft), nRight);
					} else {
						return $gren_lang$core$Dict$RBEmpty_gren_builtin;
					}
				}
			} else {
				return $gren_lang$core$Dict$node$(color, key, value, $gren_lang$core$Dict$removeHelp$(targetKey, left), right);
			}
		} else {
			return $gren_lang$core$Dict$removeHelpEQGT$(targetKey, $gren_lang$core$Dict$removeHelpPrepEQGT$(targetKey, dict, color, key, value, left, right));
		}
	}
};
var $gren_lang$core$Dict$removeHelp = F2($gren_lang$core$Dict$removeHelp$);
var $gren_lang$core$Dict$removeHelpEQGT$ = function(targetKey, dict) {
	if (dict.$ === 'RBNode_gren_builtin') {
		var _v1 = dict.a;
		var color = _v1.color;
		var key = _v1.key;
		var value = _v1.value;
		var left = _v1.left;
		var right = _v1.right;
		if (_Utils_eq(targetKey, key)) {
			var _v2 = $gren_lang$core$Dict$getMin(right);
			if (_v2.$ === 'RBNode_gren_builtin') {
				var _v3 = _v2.a;
				var minKey = _v3.key;
				var minValue = _v3.value;
				return $gren_lang$core$Dict$balance$(color, minKey, minValue, left, $gren_lang$core$Dict$removeMin(right));
			} else {
				return $gren_lang$core$Dict$RBEmpty_gren_builtin;
			}
		} else {
			return $gren_lang$core$Dict$balance$(color, key, value, left, $gren_lang$core$Dict$removeHelp$(targetKey, right));
		}
	} else {
		return $gren_lang$core$Dict$RBEmpty_gren_builtin;
	}
};
var $gren_lang$core$Dict$removeHelpEQGT = F2($gren_lang$core$Dict$removeHelpEQGT$);
var $gren_lang$core$Dict$remove$ = function(key, dict) {
	var _v0 = $gren_lang$core$Dict$removeHelp$(key, dict);
	if ((_v0.$ === 'RBNode_gren_builtin') && (_v0.a.color.$ === 'Red')) {
		var _v1 = _v0.a;
		var _v2 = _v1.color;
		var nKey = _v1.key;
		var value = _v1.value;
		var left = _v1.left;
		var right = _v1.right;
		return $gren_lang$core$Dict$node$($gren_lang$core$Dict$Black, nKey, value, left, right);
	} else {
		var x = _v0;
		return x;
	}
};
var $gren_lang$core$Dict$remove = F2($gren_lang$core$Dict$remove$);
var $gren_lang$core$Dict$update$ = function(targetKey, alter, dictionary) {
	var _v0 = alter($gren_lang$core$Dict$get$(targetKey, dictionary));
	if (_v0.$ === 'Just') {
		var value = _v0.a;
		return $gren_lang$core$Dict$set$(targetKey, value, dictionary);
	} else {
		return $gren_lang$core$Dict$remove$(targetKey, dictionary);
	}
};
var $gren_lang$core$Dict$update = F3($gren_lang$core$Dict$update$);
var $gren_lang$browser$Http$emptyBody = _Http_emptyBody;
var $gren_lang$core$Result$mapError$ = function(f, result) {
	if (result.$ === 'Ok') {
		var v = result.a;
		return $gren_lang$core$Result$Ok(v);
	} else {
		var e = result.a;
		return $gren_lang$core$Result$Err(f(e));
	}
};
var $gren_lang$core$Result$mapError = F2($gren_lang$core$Result$mapError$);
var $gren_lang$browser$Http$stringResolver = A2(_Http_expect, '', $gren_lang$core$Basics$identity);
var $gren_lang$core$Task$fail = _Scheduler_fail;
var $gren_lang$browser$Http$resultToTask = function(result) {
	if (result.$ === 'Ok') {
		var a = result.a;
		return $gren_lang$core$Task$succeed(a);
	} else {
		var x = result.a;
		return $gren_lang$core$Task$fail(x);
	}
};
var $gren_lang$browser$Http$task = function(r) {
	return A3(_Http_toTask, {  }, $gren_lang$browser$Http$resultToTask, { allowCookiesFromOtherDomains: false, body: r.body, expect: r.resolver, headers: r.headers, method: r.method, timeout: r.timeout, tracker: $gren_lang$core$Maybe$Nothing, url: r.url });
};
var $author$project$Catalog$Catalog$fetchJson$ = function(url, decoder) {
	return $gren_lang$browser$Http$task({ body: $gren_lang$browser$Http$emptyBody, headers: [  ], method: 'GET', resolver: $gren_lang$browser$Http$stringResolver(function(response) {
				switch (response.$) {
					case 'GoodStatus_':
						var good = response.a;
						return $gren_lang$core$Result$mapError$($gren_lang$core$Json$Decode$errorToString, A2($gren_lang$core$Json$Decode$decodeString, decoder, good.body));
					case 'BadStatus_':
						var bad = response.a;
						return $gren_lang$core$Result$Err('HTTP ' + ($gren_lang$core$String$fromInt(bad.metadata.statusCode) + (' : ' + url)));
					case 'BadUrl_':
						var bad = response.a;
						return $gren_lang$core$Result$Err('URL invalide : ' + bad);
					case 'Timeout_':
						return $gren_lang$core$Result$Err('délai dépassé');
					default:
						return $gren_lang$core$Result$Err('réseau indisponible');
				}
			}), timeout: $gren_lang$core$Maybe$Nothing, url: url });
};
var $author$project$Catalog$Catalog$fetchJson = F2($author$project$Catalog$Catalog$fetchJson$);
var $gren_lang$core$Json$Decode$int = _Json_decodeInt;
var $gren_lang$core$Json$Decode$map3 = _Json_map3;
var $gren_lang$core$Json$Decode$oneOf = _Json_oneOf;
var $gren_lang$core$Json$Decode$maybe = function(decoder) {
	return $gren_lang$core$Json$Decode$oneOf([ A2($gren_lang$core$Json$Decode$map, $gren_lang$core$Maybe$Just, decoder), $gren_lang$core$Json$Decode$succeed($gren_lang$core$Maybe$Nothing) ]);
};
var $author$project$Shared$Grade$optional$ = function(name, decoder) {
	return $gren_lang$core$Json$Decode$maybe(A2($gren_lang$core$Json$Decode$field, name, decoder));
};
var $author$project$Shared$Grade$optional = F2($author$project$Shared$Grade$optional$);
var $gren_lang$core$Json$Decode$string = _Json_decodeString;
var $gren_lang$core$Json$Decode$map7 = _Json_map7;
var $gren_lang$core$Json$Decode$null = _Json_decodeNull;
var $gren_lang$core$Json$Decode$nullable = function(decoder) {
	return $gren_lang$core$Json$Decode$oneOf([ $gren_lang$core$Json$Decode$null($gren_lang$core$Maybe$Nothing), A2($gren_lang$core$Json$Decode$map, $gren_lang$core$Maybe$Just, decoder) ]);
};
var $author$project$Shared$Grade$techniquePatchDecoder = A8($gren_lang$core$Json$Decode$map7, F7(function(name, order, forms, isNew, isWarning, note, video) {
			return { forms: forms, isNew: isNew, isWarning: isWarning, name: name, note: note, order: order, video: video };
		}), A2($gren_lang$core$Json$Decode$field, 'name', $gren_lang$core$Json$Decode$string), $author$project$Shared$Grade$optional$('order', $gren_lang$core$Json$Decode$int), $author$project$Shared$Grade$optional$('forms', $gren_lang$core$Json$Decode$array($gren_lang$core$Json$Decode$string)), $author$project$Shared$Grade$optional$('isNew', $gren_lang$core$Json$Decode$bool), $author$project$Shared$Grade$optional$('isWarning', $gren_lang$core$Json$Decode$bool), $author$project$Shared$Grade$optional$('note', $gren_lang$core$Json$Decode$nullable($gren_lang$core$Json$Decode$string)), $author$project$Shared$Grade$optional$('video', $gren_lang$core$Json$Decode$nullable($gren_lang$core$Json$Decode$string)));
var $author$project$Shared$Grade$attackPatchDecoder = A4($gren_lang$core$Json$Decode$map3, F3(function(name, order, techniques) {
			return { name: name, order: order, techniques: techniques };
		}), A2($gren_lang$core$Json$Decode$field, 'name', $gren_lang$core$Json$Decode$string), $author$project$Shared$Grade$optional$('order', $gren_lang$core$Json$Decode$int), A2($gren_lang$core$Json$Decode$field, 'techniques', $gren_lang$core$Json$Decode$array($author$project$Shared$Grade$techniquePatchDecoder)));
var $gren_lang$core$Json$Decode$keyValuePairs = _Json_decodeKeyValuePairs;
var $gren_lang$core$Json$Decode$dict = function(decoder) {
	return A2($gren_lang$core$Json$Decode$map, function(pairs) {
			return A3($gren_lang$core$Array$foldl, F2(function(p, coll) {
						return $gren_lang$core$Dict$set$(p.key, p.value, coll);
					}), $gren_lang$core$Dict$empty, pairs);
		}, $gren_lang$core$Json$Decode$keyValuePairs(decoder));
};
var $author$project$Shared$Grade$fileDecoder = A2($gren_lang$core$Json$Decode$field, 'waza', $gren_lang$core$Json$Decode$dict($gren_lang$core$Json$Decode$array($author$project$Shared$Grade$attackPatchDecoder)));
var $gren_lang$core$Json$Decode$map4 = _Json_map4;
var $author$project$Shared$Grade$gradeInfoDecoder = A5($gren_lang$core$Json$Decode$map4, F4(function(id, label, file, includes) {
			return { file: file, id: id, includes: includes, label: label };
		}), A2($gren_lang$core$Json$Decode$field, 'id', $gren_lang$core$Json$Decode$string), A2($gren_lang$core$Json$Decode$field, 'label', $gren_lang$core$Json$Decode$string), A2($gren_lang$core$Json$Decode$field, 'file', $gren_lang$core$Json$Decode$string), A2($gren_lang$core$Json$Decode$map, $gren_lang$core$Maybe$withDefault([  ]), $author$project$Shared$Grade$optional$('includes', $gren_lang$core$Json$Decode$array($gren_lang$core$Json$Decode$string))));
var $gren_lang$core$Array$member$ = function(value, array) {
	var _v0 = A2($gren_lang$core$Array$findFirst, function(v) {
			return _Utils_eq(v, value);
		}, array);
	if (_v0.$ === 'Just') {
		return true;
	} else {
		return false;
	}
};
var $gren_lang$core$Array$member = F2($gren_lang$core$Array$member$);
var $author$project$Catalog$Catalog$loadGrades = A2($gren_lang$core$Task$andThen, function(infos) {
		var files = A3($gren_lang$core$Array$foldl, F2(function(info, known) {
					return A3($gren_lang$core$Array$foldl, F2(function(file, list) {
								return $gren_lang$core$Array$member$(file, list) ? list : $gren_lang$core$Array$pushLast$(file, list);
							}), known, $gren_lang$core$Array$pushLast$(info.file, info.includes));
				}), [  ], infos);
		return $gren_lang$core$Task$map$(function(loaded) {
				return A2($gren_lang$core$Array$map, $author$project$Catalog$Catalog$assemble(loaded), infos);
			}, $gren_lang$core$Task$sequence(A2($gren_lang$core$Array$map, function(file) {
						return $gren_lang$core$Task$map$(function(patch) {
								return { file: file, patch: patch };
							}, $author$project$Catalog$Catalog$fetchJson$('data/' + file, $author$project$Shared$Grade$fileDecoder));
					}, files)));
	}, $author$project$Catalog$Catalog$fetchJson$('data/grades.json', $gren_lang$core$Json$Decode$array($author$project$Shared$Grade$gradeInfoDecoder)));
var $author$project$Catalog$Catalog$init = { command: $gren_lang$core$Task$attempt$($author$project$Catalog$Catalog$Loaded, $author$project$Catalog$Catalog$loadGrades), model: { filters: { isNew: false, isWarning: false }, gradeId: '', grades: [  ], status: $author$project$Catalog$Catalog$Loading } };
var $author$project$Shared$Route$Attacks = { $: 'Attacks' };
var $author$project$Shared$Route$TechniqueCard = function (a) {
	return { $: 'TechniqueCard', a: a };
};
var $author$project$Shared$Route$Techniques = function (a) {
	return { $: 'Techniques', a: a };
};
var $author$project$Shared$Route$empty = { grade: $gren_lang$core$Maybe$Nothing, program: $gren_lang$core$Maybe$Nothing, waza: $gren_lang$core$Maybe$Nothing };
var $gren_lang$core$Array$keepIf = _Array_filter;
var $gren_lang$core$Basics$neq = _Utils_notEqual;


function _Url_percentEncode(string)
{
	return encodeURIComponent(string);
}

function _Url_percentDecode(string)
{
	try
	{
		return $gren_lang$core$Maybe$Just(decodeURIComponent(string));
	}
	catch (e)
	{
		return $gren_lang$core$Maybe$Nothing;
	}
}
var $gren_lang$url$Url$percentDecode = _Url_percentDecode;
var $author$project$Shared$Route$parse = function(fragment) {
	var raw = A2($gren_lang$core$Array$keepIf, function(part) {
			return part !== '';
		}, A2($gren_lang$core$String$split, '/', fragment));
	var parts = $gren_lang$core$Array$mapAndKeepJust$($gren_lang$url$Url$percentDecode, raw);
	return (!_Utils_eq($gren_lang$core$Array$length(parts), $gren_lang$core$Array$length(raw))) ? $author$project$Shared$Route$empty : { grade: A2($gren_lang$core$Array$get, 0, parts), program: _Utils_eq(A2($gren_lang$core$Array$get, 2, parts), $gren_lang$core$Maybe$Just('program')) ? $gren_lang$core$Maybe$Just(function () {
			var _v0 = { attack: A2($gren_lang$core$Array$get, 3, parts), technique: A2($gren_lang$core$Array$get, 4, parts) };
			if (_v0.attack.$ === 'Just') {
				if (_v0.technique.$ === 'Just') {
					var attack = _v0.attack.a;
					var technique = _v0.technique.a;
					return $author$project$Shared$Route$TechniqueCard({ attack: attack, technique: technique });
				} else {
					var attack = _v0.attack.a;
					return $author$project$Shared$Route$Techniques(attack);
				}
			} else {
				return $author$project$Shared$Route$Attacks;
			}
		}()) : $gren_lang$core$Maybe$Nothing, waza: A2($gren_lang$core$Array$get, 1, parts) };
};
var $author$project$Navigation$Navigation$routeOf = function(url) {
	return $author$project$Shared$Route$parse($gren_lang$core$Maybe$withDefault$('', url.fragment));
};
var $author$project$Navigation$Navigation$init$ = function(key, url) {
	return { initialRoute: $author$project$Navigation$Navigation$routeOf(url), key: key };
};
var $author$project$Navigation$Navigation$init = F2($author$project$Navigation$Navigation$init$);
var $author$project$Slide$Slide$Still = { $: 'Still' };
var $author$project$Slide$Slide$init = { count: 0, direction: $author$project$Slide$Slide$Still };
var $author$project$Video$Video$init = function(skipWarning) {
	return { prompt: $gren_lang$core$Maybe$Nothing, skipWarning: skipWarning };
};
var $author$project$Root$init$ = function(flags, url, key) {
	var catalog = $author$project$Catalog$Catalog$init;
	return { command: A2($gren_lang$core$Platform$Cmd$map, $author$project$Root$CatalogMsg, catalog.command), model: { catalog: catalog.model, navigation: $author$project$Navigation$Navigation$init$(key, url), screen: $author$project$Root$Home, slide: $author$project$Slide$Slide$init, video: $author$project$Video$Video$init(flags.skipVideoWarning) } };
};
var $author$project$Root$init = F3($author$project$Root$init$);
var $gren_lang$core$Platform$Sub$batch = _Platform_batch;
var $gren_lang$core$Platform$Sub$none = $gren_lang$core$Platform$Sub$batch([  ]);
var $author$project$Slide$Slide$Forward = { $: 'Forward' };
var $author$project$Root$Program = function (a) {
	return { $: 'Program', a: a };
};
var $author$project$Root$ProgramMsg = function (a) {
	return { $: 'ProgramMsg', a: a };
};
var $author$project$Root$Quiz = function (a) {
	return { $: 'Quiz', a: a };
};
var $author$project$Root$QuizMsg = function (a) {
	return { $: 'QuizMsg', a: a };
};
var $author$project$Root$VideoMsg = function (a) {
	return { $: 'VideoMsg', a: a };
};
var $gren_lang$core$Platform$Cmd$batch = _Platform_batch;
var $author$project$Root$applyEvents$ = function(handle, events, initial) {
	return A3($gren_lang$core$Array$foldl, F2(function(event, acc) {
				var handled = A2(handle, event, acc.model);
				return { command: $gren_lang$core$Platform$Cmd$batch([ acc.command, handled.command ]), model: handled.model };
			}), initial, events);
};
var $author$project$Root$applyEvents = F3($author$project$Root$applyEvents$);
var $author$project$Slide$Slide$Back = { $: 'Back' };
var $gren_lang$browser$Browser$Navigation$pushUrl = _Browser_pushUrl;
var $gren_lang$url$Url$percentEncode = _Url_percentEncode;
var $gren_lang$core$Array$prepend = _Array_append;
var $author$project$Shared$Route$toHash = function(route) {
	var program = function () {
		var _v0 = route.program;
		if (_v0.$ === 'Nothing') {
			return [  ];
		} else {
			switch (_v0.a.$) {
				case 'Attacks':
					var _v1 = _v0.a;
					return [ 'program' ];
				case 'Techniques':
					var attack = _v0.a.a;
					return [ 'program', attack ];
				default:
					var card = _v0.a.a;
					return [ 'program', card.attack, card.technique ];
			}
		}
	}();
	var parts = A2($gren_lang$core$Array$prepend, $gren_lang$core$Array$mapAndKeepJust$($gren_lang$core$Basics$identity, [ route.grade, route.waza ]), program);
	return '#/' + A2($gren_lang$core$String$join, '/', A2($gren_lang$core$Array$map, $gren_lang$url$Url$percentEncode, parts));
};
var $author$project$Navigation$Navigation$push$ = function(model, route) {
	return A2($gren_lang$browser$Browser$Navigation$pushUrl, model.key, $author$project$Shared$Route$toHash(route));
};
var $author$project$Navigation$Navigation$push = F2($author$project$Navigation$Navigation$push$);
var $author$project$Root$routeOf = function(model) {
	var base = { grade: $gren_lang$core$Maybe$Just(model.catalog.gradeId), program: $gren_lang$core$Maybe$Nothing, waza: $gren_lang$core$Maybe$Nothing };
	var _v0 = model.screen;
	switch (_v0.$) {
		case 'Home':
			return base;
		case 'Quiz':
			var quiz = _v0.a;
			return _Utils_update(base, { waza: $gren_lang$core$Maybe$Just(quiz.waza) });
		default:
			var program = _v0.a;
			return _Utils_update(base, { program: $gren_lang$core$Maybe$Just(program.level), waza: $gren_lang$core$Maybe$Just(program.waza) });
	}
};
var $author$project$Root$pushUrl = function(result) {
	return { command: $gren_lang$core$Platform$Cmd$batch([ result.command, $author$project$Navigation$Navigation$push$(result.model.navigation, $author$project$Root$routeOf(result.model)) ]), model: result.model };
};
var $author$project$Root$NoOp = { $: 'NoOp' };
var $gren_lang$browser$Browser$Dom$setViewport = _Browser_setViewport;
var $author$project$Shared$Effect$scrollTop = function(done) {
	return $gren_lang$core$Task$perform$(function(_v0) {
			return done;
		}, A2($gren_lang$browser$Browser$Dom$setViewport, 0, 0));
};
var $author$project$Root$scrollTop = $author$project$Shared$Effect$scrollTop($author$project$Root$NoOp);
var $author$project$Slide$Slide$advance$ = function(direction, model) {
	return { count: model.count + 1, direction: direction };
};
var $author$project$Slide$Slide$advance = F2($author$project$Slide$Slide$advance$);
var $author$project$Root$slide$ = function(direction, model) {
	return _Utils_update(model, { slide: $author$project$Slide$Slide$advance$(direction, model.slide) });
};
var $author$project$Root$slide = F2($author$project$Root$slide$);
var $gren_lang$core$Platform$Cmd$none = $gren_lang$core$Platform$Cmd$batch([  ]);
var $author$project$Root$stay = function(model) {
	return { command: $gren_lang$core$Platform$Cmd$none, model: model };
};
var $author$project$Root$goHome = function(model) {
	var _v0 = model.screen;
	switch (_v0.$) {
		case 'Home':
			return $author$project$Root$stay(model);
		case 'Quiz':
			return $author$project$Root$pushUrl({ command: $author$project$Root$scrollTop, model: $author$project$Root$slide$($author$project$Slide$Slide$Forward, _Utils_update(model, { screen: $author$project$Root$Home })) });
		default:
			return $author$project$Root$pushUrl({ command: $author$project$Root$scrollTop, model: $author$project$Root$slide$($author$project$Slide$Slide$Back, _Utils_update(model, { screen: $author$project$Root$Home })) });
	}
};
var $author$project$Catalog$Catalog$currentData = function(model) {
	return $gren_lang$core$Maybe$withDefault$($gren_lang$core$Dict$empty, $gren_lang$core$Maybe$map$(function(found) {
				return found.value.data;
			}, A2($gren_lang$core$Array$findFirst, function(grade) {
					return _Utils_eq(grade.info.id, model.gradeId);
				}, model.grades)));
};
var $author$project$Root$currentData = function(model) {
	return $author$project$Catalog$Catalog$currentData(model.catalog);
};
var $author$project$Shared$Grade$attacksOf$ = function(data, waza) {
	return $gren_lang$core$Maybe$withDefault$([  ], $gren_lang$core$Dict$get$(waza, data));
};
var $author$project$Shared$Grade$attacksOf = F2($author$project$Shared$Grade$attacksOf$);
var $gren_lang$core$Array$isEmpty = function(array) {
	return $gren_lang$core$Array$length(array) === 0;
};
var $gren_lang$core$Basics$mul = _Basics_mul;
var $author$project$Shared$Grade$weightNew = 1.5;
var $author$project$Shared$Grade$weightWarning = 1.5;
var $author$project$Shared$Grade$buildPool$ = function(data, waza, filters) {
	var weightOf = function(technique) {
		return (technique.isNew ? $author$project$Shared$Grade$weightNew : 1) * (technique.isWarning ? $author$project$Shared$Grade$weightWarning : 1);
	};
	var filtering = filters.isNew || filters.isWarning;
	var selected = function(technique) {
		return (!filtering) || ((filters.isNew && technique.isNew) || (filters.isWarning && technique.isWarning));
	};
	var entriesOf = F2(function(attack, technique) {
			return $gren_lang$core$Array$isEmpty(technique.forms) ? [ { attack: attack.name, form: $gren_lang$core$Maybe$Nothing, technique: technique.name, weight: weightOf(technique) } ] : A2($gren_lang$core$Array$map, function(form) {
					return { attack: attack.name, form: $gren_lang$core$Maybe$Just(form), technique: technique.name, weight: weightOf(technique) };
				}, technique.forms);
		});
	return A2($gren_lang$core$Array$mapAndFlatten, function(attack) {
			return A2($gren_lang$core$Array$mapAndFlatten, entriesOf(attack), A2($gren_lang$core$Array$keepIf, selected, attack.techniques));
		}, $author$project$Shared$Grade$attacksOf$(data, waza));
};
var $author$project$Shared$Grade$buildPool = F3($author$project$Shared$Grade$buildPool$);
var $author$project$Quiz$Quiz$Rolled = function (a) {
	return { $: 'Rolled', a: a };
};
var $gren_lang$core$Random$Generator = function (a) {
	return { $: 'Generator', a: a };
};
var $gren_lang$core$Basics$negate = function(n) {
	return -n;
};
var $gren_lang$core$Math$abs = function(n) {
	return (n < 0) ? (-n) : n;
};


var _Bitwise_and = F2(function (a, b) {
  return a & b;
});

var _Bitwise_or = F2(function (a, b) {
  return a | b;
});

var _Bitwise_xor = F2(function (a, b) {
  return a ^ b;
});

function _Bitwise_complement(a) {
  return ~a;
}

var _Bitwise_countLeadingZeros = Math.clz32;

var _Bitwise_shiftLeftBy = F2(function (offset, a) {
  return a << offset;
});

var _Bitwise_shiftRightBy = F2(function (offset, a) {
  return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function (offset, a) {
  return a >>> offset;
});
var $gren_lang$core$Bitwise$and = _Bitwise_and;
var $gren_lang$core$Basics$fdiv = _Basics_fdiv;
var $gren_lang$core$Random$Seed = function (a) {
	return { $: 'Seed', a: a };
};
var $gren_lang$core$Bitwise$shiftRightZfBy = _Bitwise_shiftRightZfBy;
var $gren_lang$core$Random$next = function(_v0) {
	var _v1 = _v0.a;
	var state0 = _v1.state;
	var incr = _v1.increment;
	return $gren_lang$core$Random$Seed({ increment: incr, state: ((state0 * 1664525) + incr) >>> 0 });
};
var $gren_lang$core$Bitwise$xor = _Bitwise_xor;
var $gren_lang$core$Random$peel = function(_v0) {
	var state = _v0.a.state;
	var word = (state ^ (state >>> ((state >>> 28) + 4))) * 277803737;
	return ((word >>> 22) ^ word) >>> 0;
};
var $gren_lang$core$Basics$toFloat = _Basics_toFloat;
var $gren_lang$core$Random$float$ = function(a, b) {
	return $gren_lang$core$Random$Generator(function(seed0) {
			var seed1 = $gren_lang$core$Random$next(seed0);
			var range = $gren_lang$core$Math$abs(b - a);
			var n1 = $gren_lang$core$Random$peel(seed1);
			var n0 = $gren_lang$core$Random$peel(seed0);
			var _v0 = (_Utils_cmp(n0, n1) > 0) ? { nHi: n0, nLo: n1 } : { nHi: n1, nLo: n0 };
			var nHi = _v0.nHi;
			var nLo = _v0.nLo;
			var hi = (67108863 & nHi) * 1.0;
			var lo = (134217727 & nLo) * 1.0;
			var val = ((hi * 134217728.0) + lo) / 9007199254740992.0;
			var scaled = (val * range) + a;
			return { seed: $gren_lang$core$Random$next(seed1), value: scaled };
		});
};
var $gren_lang$core$Random$float = F2($gren_lang$core$Random$float$);
var $gren_lang$core$Random$Generate = function (a) {
	return { $: 'Generate', a: a };
};
var $gren_lang$core$Random$initialSeed = function(x) {
	var _v0 = $gren_lang$core$Random$next($gren_lang$core$Random$Seed({ increment: 1013904223, state: 0 }));
	var _v1 = _v0.a;
	var state1 = _v1.state;
	var incr = _v1.increment;
	var state2 = (state1 + x) >>> 0;
	return $gren_lang$core$Random$next($gren_lang$core$Random$Seed({ increment: incr, state: state2 }));
};


function _Time_now(millisToPosix) {
  return _Scheduler_binding(function (callback) {
    callback(_Scheduler_succeed(millisToPosix(Date.now())));
  });
}

var _Time_setInterval = F2(function (interval, task) {
  return _Scheduler_binding(function (callback) {
    var id = setInterval(function () {
      _Scheduler_rawSpawn(task);
    }, interval);
    return function () {
      clearInterval(id);
    };
  });
});

function _Time_here() {
  return _Scheduler_binding(function (callback) {
    callback(
      _Scheduler_succeed(
        A2($gren_lang$core$Time$customZone, -new Date().getTimezoneOffset(), []),
      ),
    );
  });
}

function _Time_getZoneName() {
  return _Scheduler_binding(function (callback) {
    try {
      var name = $gren_lang$core$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch (e) {
      var name = $gren_lang$core$Time$Offset(new Date().getTimezoneOffset());
    }
    callback(_Scheduler_succeed(name));
  });
}
var $gren_lang$core$Time$Name = function (a) {
	return { $: 'Name', a: a };
};
var $gren_lang$core$Time$Offset = function (a) {
	return { $: 'Offset', a: a };
};
var $gren_lang$core$Time$Zone = function (a) {
	return { $: 'Zone', a: a };
};
var $gren_lang$core$Time$customZone$ = function(offset, eras) {
	return $gren_lang$core$Time$Zone({ eras: eras, offset: offset });
};
var $gren_lang$core$Time$customZone = F2($gren_lang$core$Time$customZone$);
var $gren_lang$core$Time$Posix = function (a) {
	return { $: 'Posix', a: a };
};
var $gren_lang$core$Time$millisToPosix = $gren_lang$core$Time$Posix;
var $gren_lang$core$Time$now = _Time_now($gren_lang$core$Time$millisToPosix);
var $gren_lang$core$Time$posixToMillis = function(_v0) {
	var millis = _v0.a;
	return millis;
};
var $gren_lang$core$Random$init = A2($gren_lang$core$Task$andThen, function(time) {
		return $gren_lang$core$Task$succeed($gren_lang$core$Random$initialSeed($gren_lang$core$Time$posixToMillis(time)));
	}, $gren_lang$core$Time$now);
var $gren_lang$core$Array$slice = _Array_slice;
var $gren_lang$core$Array$dropFirst$ = function(n, array) {
	return A3($gren_lang$core$Array$slice, n, $gren_lang$core$Array$length(array), array);
};
var $gren_lang$core$Array$dropFirst = F2($gren_lang$core$Array$dropFirst$);
var $gren_lang$core$Array$first = function(array) {
	return A2($gren_lang$core$Array$get, 0, array);
};
var $gren_lang$core$Array$popFirst = function(array) {
	var _v0 = $gren_lang$core$Array$first(array);
	if (_v0.$ === 'Just') {
		var value = _v0.a;
		return $gren_lang$core$Maybe$Just({ first: value, rest: $gren_lang$core$Array$dropFirst$(1, array) });
	} else {
		return $gren_lang$core$Maybe$Nothing;
	}
};
var $gren_lang$core$Random$step$ = function(_v0, seed) {
	var generator = _v0.a;
	return generator(seed);
};
var $gren_lang$core$Random$step = F2($gren_lang$core$Random$step$);
var $gren_lang$core$Random$onEffects$ = function(router, commands, seed) {
	var _v0 = $gren_lang$core$Array$popFirst(commands);
	if (_v0.$ === 'Nothing') {
		return $gren_lang$core$Task$succeed(seed);
	} else {
		var _v1 = _v0.a;
		var generator = _v1.first.a;
		var rest = _v1.rest;
		var _v2 = $gren_lang$core$Random$step$(generator, seed);
		var value = _v2.value;
		var newSeed = _v2.seed;
		return A2($gren_lang$core$Task$andThen, function(_v3) {
				return $gren_lang$core$Random$onEffects$(router, rest, newSeed);
			}, A2($gren_lang$core$Platform$sendToApp, router, value));
	}
};
var $gren_lang$core$Random$onEffects = F3($gren_lang$core$Random$onEffects$);
var $gren_lang$core$Random$onSelfMsg$ = function(_v0, _v1, seed) {
	return $gren_lang$core$Task$succeed(seed);
};
var $gren_lang$core$Random$onSelfMsg = F3($gren_lang$core$Random$onSelfMsg$);
var $gren_lang$core$Random$map$ = function(func, _v0) {
	var genA = _v0.a;
	return $gren_lang$core$Random$Generator(function(seed0) {
			var _v1 = genA(seed0);
			var a = _v1.value;
			var seed1 = _v1.seed;
			return { seed: seed1, value: func(a) };
		});
};
var $gren_lang$core$Random$map = F2($gren_lang$core$Random$map$);
var $gren_lang$core$Random$cmdMap$ = function(func, _v0) {
	var generator = _v0.a;
	return $gren_lang$core$Random$Generate($gren_lang$core$Random$map$(func, generator));
};
var $gren_lang$core$Random$cmdMap = F2($gren_lang$core$Random$cmdMap$);
_Platform_effectManagers['Random'] = _Platform_createManager($gren_lang$core$Random$init, $gren_lang$core$Random$onEffects, $gren_lang$core$Random$onSelfMsg, $gren_lang$core$Random$cmdMap);
var $gren_lang$core$Random$command = _Platform_leaf('Random');
var $gren_lang$core$Random$generate$ = function(tagger, generator) {
	return $gren_lang$core$Random$command($gren_lang$core$Random$Generate($gren_lang$core$Random$map$(tagger, generator)));
};
var $gren_lang$core$Random$generate = F2($gren_lang$core$Random$generate$);
var $author$project$Quiz$Quiz$roll = $gren_lang$core$Random$generate$($author$project$Quiz$Quiz$Rolled, $gren_lang$core$Random$float$(0, 1));
var $author$project$Quiz$Quiz$start$ = function(data, filters, waza) {
	var pool = $author$project$Shared$Grade$buildPool$(data, waza, filters);
	return { command: $gren_lang$core$Array$isEmpty(pool) ? $gren_lang$core$Platform$Cmd$none : $author$project$Quiz$Quiz$roll, model: { current: $gren_lang$core$Maybe$Nothing, done: $gren_lang$core$Array$isEmpty(pool), pool: pool, total: $gren_lang$core$Array$length(pool), waza: waza } };
};
var $author$project$Quiz$Quiz$start = F3($author$project$Quiz$Quiz$start$);
var $author$project$Root$startSession$ = function(model, waza) {
	var started = $author$project$Quiz$Quiz$start$($author$project$Root$currentData(model), model.catalog.filters, waza);
	return { command: A2($gren_lang$core$Platform$Cmd$map, $author$project$Root$QuizMsg, started.command), model: _Utils_update(model, { screen: $author$project$Root$Quiz(started.model) }) };
};
var $author$project$Root$startSession = F2($author$project$Root$startSession$);
var $author$project$Root$startQuiz$ = function(direction, waza, model) {
	var started = $author$project$Root$startSession$(model, waza);
	return $author$project$Root$pushUrl({ command: $gren_lang$core$Platform$Cmd$batch([ started.command, $author$project$Root$scrollTop ]), model: $author$project$Root$slide$(direction, started.model) });
};
var $author$project$Root$startQuiz = F3($author$project$Root$startQuiz$);
var $author$project$Catalog$Catalog$Failed = function (a) {
	return { $: 'Failed', a: a };
};
var $author$project$Catalog$Catalog$GradeChanged = { $: 'GradeChanged' };
var $author$project$Catalog$Catalog$GradesReady = { $: 'GradesReady' };
var $author$project$Catalog$Catalog$Ready = { $: 'Ready' };
var $author$project$Catalog$Catalog$firstGrade = function(grades) {
	return $gren_lang$core$Maybe$withDefault$('', $gren_lang$core$Maybe$map$(function(grade) {
				return grade.info.id;
			}, A2($gren_lang$core$Array$get, 0, grades)));
};
var $gren_lang$core$Array$any$ = function(fn, array) {
	var _v0 = A2($gren_lang$core$Array$findFirst, fn, array);
	if (_v0.$ === 'Just') {
		return true;
	} else {
		return false;
	}
};
var $gren_lang$core$Array$any = F2($gren_lang$core$Array$any$);
var $author$project$Catalog$Catalog$isKnown$ = function(id, model) {
	return $gren_lang$core$Array$any$(function(grade) {
			return _Utils_eq(grade.info.id, id);
		}, model.grades);
};
var $author$project$Catalog$Catalog$isKnown = F2($author$project$Catalog$Catalog$isKnown$);
var $author$project$Catalog$Catalog$update$ = function(msg, model) {
	switch (msg.$) {
		case 'Loaded':
			if (msg.a.$ === 'Err') {
				var message = msg.a.a;
				return { command: $gren_lang$core$Platform$Cmd$none, events: [  ], model: _Utils_update(model, { status: $author$project$Catalog$Catalog$Failed('Chargement impossible (' + (message + ')')) }) };
			} else {
				var grades = msg.a.a;
				return { command: $gren_lang$core$Platform$Cmd$none, events: [ $author$project$Catalog$Catalog$GradesReady ], model: _Utils_update(model, { gradeId: $author$project$Catalog$Catalog$firstGrade(grades), grades: grades, status: $author$project$Catalog$Catalog$Ready }) };
			}
		case 'SelectGrade':
			var id = msg.a;
			return $author$project$Catalog$Catalog$isKnown$(id, model) ? { command: $gren_lang$core$Platform$Cmd$none, events: [ $author$project$Catalog$Catalog$GradeChanged ], model: _Utils_update(model, { gradeId: id }) } : { command: $gren_lang$core$Platform$Cmd$none, events: [  ], model: model };
		case 'FilterNew':
			var checked = msg.a;
			return { command: $gren_lang$core$Platform$Cmd$none, events: [  ], model: _Utils_update(model, { filters: { isNew: checked, isWarning: model.filters.isWarning } }) };
		default:
			var checked = msg.a;
			return { command: $gren_lang$core$Platform$Cmd$none, events: [  ], model: _Utils_update(model, { filters: { isNew: model.filters.isNew, isWarning: checked } }) };
	}
};
var $author$project$Catalog$Catalog$update = F2($author$project$Catalog$Catalog$update$);
var $author$project$Navigation$Navigation$RouteChanged = function (a) {
	return { $: 'RouteChanged', a: a };
};
var $gren_lang$browser$Browser$Navigation$load = _Browser_load;
var $gren_lang$url$Url$addPort$ = function(maybePort, starter) {
	if (maybePort.$ === 'Nothing') {
		return starter;
	} else {
		var port_ = maybePort.a;
		return starter + (':' + $gren_lang$core$String$fromInt(port_));
	}
};
var $gren_lang$url$Url$addPort = F2($gren_lang$url$Url$addPort$);
var $gren_lang$url$Url$addPrefixed$ = function(prefix, maybeSegment, starter) {
	if (maybeSegment.$ === 'Nothing') {
		return starter;
	} else {
		var segment = maybeSegment.a;
		return _Utils_ap(starter, _Utils_ap(prefix, segment));
	}
};
var $gren_lang$url$Url$addPrefixed = F3($gren_lang$url$Url$addPrefixed$);
var $gren_lang$url$Url$toString = function(url) {
	var http = function () {
		var _v0 = url.protocol;
		if (_v0.$ === 'Http') {
			return 'http://';
		} else {
			return 'https://';
		}
	}();
	return $gren_lang$url$Url$addPrefixed$('#', url.fragment, $gren_lang$url$Url$addPrefixed$('?', url.query, _Utils_ap($gren_lang$url$Url$addPort$(url.port_, _Utils_ap(http, url.host)), url.path)));
};
var $author$project$Navigation$Navigation$update$ = function(msg, model) {
	if (msg.$ === 'UrlRequested') {
		if (msg.a.$ === 'Internal') {
			var url = msg.a.a;
			return { command: $gren_lang$browser$Browser$Navigation$load($gren_lang$url$Url$toString(url)), events: [  ], model: model };
		} else {
			var url = msg.a.a;
			return { command: $gren_lang$browser$Browser$Navigation$load(url), events: [  ], model: model };
		}
	} else {
		var url = msg.a;
		return { command: $gren_lang$core$Platform$Cmd$none, events: [ $author$project$Navigation$Navigation$RouteChanged($author$project$Navigation$Navigation$routeOf(url)) ], model: model };
	}
};
var $author$project$Navigation$Navigation$update = F2($author$project$Navigation$Navigation$update$);
var $author$project$Program$Program$Closed = function (a) {
	return { $: 'Closed', a: a };
};
var $author$project$Program$Program$HomeRequested = { $: 'HomeRequested' };
var $author$project$Program$Program$Moved = function (a) {
	return { $: 'Moved', a: a };
};
var $author$project$Program$Program$VideoRequested = function (a) {
	return { $: 'VideoRequested', a: a };
};
var $author$project$Program$Program$depth = function(level) {
	switch (level.$) {
		case 'Attacks':
			return 1;
		case 'Techniques':
			return 2;
		default:
			return 3;
	}
};
var $author$project$Program$Program$update$ = function(msg, model) {
	switch (msg.$) {
		case 'Navigate':
			var target = msg.a;
			var direction = function () {
				var _v1 = target.direction;
				if (_v1.$ === 'Just') {
					var given = _v1.a;
					return given;
				} else {
					return (_Utils_cmp($author$project$Program$Program$depth(target.to), $author$project$Program$Program$depth(model.level)) < 0) ? $author$project$Slide$Slide$Back : $author$project$Slide$Slide$Forward;
				}
			}();
			return { command: $gren_lang$core$Platform$Cmd$none, events: [ $author$project$Program$Program$Moved(direction) ], model: _Utils_update(model, { level: target.to }) };
		case 'Close':
			return { command: $gren_lang$core$Platform$Cmd$none, events: [ $author$project$Program$Program$Closed(model.waza) ], model: model };
		case 'GoHome':
			return { command: $gren_lang$core$Platform$Cmd$none, events: [ $author$project$Program$Program$HomeRequested ], model: model };
		default:
			var url = msg.a;
			return { command: $gren_lang$core$Platform$Cmd$none, events: [ $author$project$Program$Program$VideoRequested(url) ], model: model };
	}
};
var $author$project$Program$Program$update = F2($author$project$Program$Program$update$);
var $author$project$Quiz$Quiz$CardChanged = { $: 'CardChanged' };
var $author$project$Quiz$Quiz$HomeRequested = { $: 'HomeRequested' };
var $author$project$Quiz$Quiz$ProgramRequested = function (a) {
	return { $: 'ProgramRequested', a: a };
};
var $author$project$Quiz$Quiz$VideoRequested = function (a) {
	return { $: 'VideoRequested', a: a };
};
var $gren_lang$core$Basics$max$ = function(x, y) {
	return (_Utils_cmp(x, y) > 0) ? x : y;
};
var $gren_lang$core$Basics$max = F2($gren_lang$core$Basics$max$);
var $author$project$Shared$Grade$pickFrom$ = function(pool, left, index) {
	pickFrom:
	while (true) {
		var _v0 = A2($gren_lang$core$Array$get, index, pool);
		if (_v0.$ === 'Nothing') {
			return $gren_lang$core$Basics$max$(0, $gren_lang$core$Array$length(pool) - 1);
		} else {
			var entry = _v0.a;
			if ((left - entry.weight) <= 0) {
				return index;
			} else {
				var $temp$pool = pool,
				$temp$left = left - entry.weight,
				$temp$index = index + 1;
				pool = $temp$pool;
				left = $temp$left;
				index = $temp$index;
				continue pickFrom;
			}
		}
	}
};
var $author$project$Shared$Grade$pickFrom = F3($author$project$Shared$Grade$pickFrom$);
var $author$project$Shared$Grade$pickIndex$ = function(pool, random) {
	var total = A3($gren_lang$core$Array$foldl, F2(function(entry, sum) {
				return sum + entry.weight;
			}), 0, pool);
	return $author$project$Shared$Grade$pickFrom$(pool, random * total, 0);
};
var $author$project$Shared$Grade$pickIndex = F2($author$project$Shared$Grade$pickIndex$);
var $gren_lang$core$Array$removeMany = _Array_splice0;
var $gren_lang$core$Array$remove$ = function(index, array) {
	return A3($gren_lang$core$Array$removeMany, index, 1, array);
};
var $gren_lang$core$Array$remove = F2($gren_lang$core$Array$remove$);
var $author$project$Quiz$Quiz$update$ = function(msg, model) {
	switch (msg.$) {
		case 'Next':
			return $gren_lang$core$Array$isEmpty(model.pool) ? { command: $gren_lang$core$Platform$Cmd$none, events: [ $author$project$Quiz$Quiz$CardChanged ], model: _Utils_update(model, { current: $gren_lang$core$Maybe$Nothing, done: true }) } : { command: $author$project$Quiz$Quiz$roll, events: [  ], model: model };
		case 'Rolled':
			var random = msg.a;
			if ($gren_lang$core$Array$isEmpty(model.pool)) {
				return { command: $gren_lang$core$Platform$Cmd$none, events: [  ], model: model };
			} else {
				var index = $author$project$Shared$Grade$pickIndex$(model.pool, random);
				return { command: $gren_lang$core$Platform$Cmd$none, events: [ $author$project$Quiz$Quiz$CardChanged ], model: _Utils_update(model, { current: A2($gren_lang$core$Array$get, index, model.pool), pool: $gren_lang$core$Array$remove$(index, model.pool) }) };
			}
		case 'GoHome':
			return { command: $gren_lang$core$Platform$Cmd$none, events: [ $author$project$Quiz$Quiz$HomeRequested ], model: model };
		case 'OpenProgram':
			return { command: $gren_lang$core$Platform$Cmd$none, events: [ $author$project$Quiz$Quiz$ProgramRequested(model.waza) ], model: model };
		default:
			var url = msg.a;
			return { command: $gren_lang$core$Platform$Cmd$none, events: [ $author$project$Quiz$Quiz$VideoRequested(url) ], model: model };
	}
};
var $author$project$Quiz$Quiz$update = F2($author$project$Quiz$Quiz$update$);
var $author$project$Video$Video$Saved = { $: 'Saved' };


var _WebStorage_length = function (useLocalStorage) {
  return _Scheduler_binding(function (callback) {
    try {
      var length = _WebStorage_getStore(useLocalStorage).length;
    } catch (e) {
      return callback(_Scheduler_fail($gren_lang$browser$WebStorage$AccessError));
    }

    return callback(_Scheduler_succeed(length));
  });
};

var _WebStorage_key = F2(function (useLocalStorage, index) {
  return _Scheduler_binding(function (callback) {
    try {
      var key = _WebStorage_getStore(useLocalStorage).key(index);

      if (key == null) {
        return callback(_Scheduler_fail($gren_lang$browser$WebStorage$NoValue));
      } else {
        return callback(_Scheduler_succeed(key));
      }
    } catch (e) {
      return callback(_Scheduler_fail($gren_lang$browser$WebStorage$ReadBlocked));
    }
  });
});

var _WebStorage_get = F2(function (useLocalStorage, key) {
  return _Scheduler_binding(function (callback) {
    try {
      var item = _WebStorage_getStore(useLocalStorage).getItem(key);

      if (item == null) {
        return callback(_Scheduler_fail($gren_lang$browser$WebStorage$NoValue));
      } else {
        return callback(_Scheduler_succeed(item));
      }
    } catch (e) {
      return callback(_Scheduler_fail($gren_lang$browser$WebStorage$ReadBlocked));
    }
  });
});

var _WebStorage_set = F3(function (useLocalStorage, key, value) {
  return _Scheduler_binding(function (callback) {
    try {
      _WebStorage_getStore(useLocalStorage).setItem(key, value);
    } catch (err) {
      if (err.name === "QuotaExceededError") {
        return callback(_Scheduler_fail($gren_lang$browser$WebStorage$QuotaExceeded));
      } else {
        return callback(_Scheduler_fail($gren_lang$browser$WebStorage$WriteBlocked));
      }
    }

    return callback(_Scheduler_succeed({}));
  });
});

var _WebStorage_remove = F2(function (useLocalStorage, key) {
  return _Scheduler_binding(function (callback) {
    try {
      _WebStorage_getStore(useLocalStorage).removeItem(key);
    } catch (err) {
      return callback(_Scheduler_fail($gren_lang$browser$WebStorage$AccessError));
    }

    return callback(_Scheduler_succeed({}));
  });
});

var _WebStorage_clear = function (useLocalStorage) {
  return _Scheduler_binding(function (callback) {
    try {
      _WebStorage_getStore(useLocalStorage).clear();
    } catch (err) {
      return callback(_Scheduler_fail($gren_lang$browser$WebStorage$AccessError));
    }

    return callback(_Scheduler_succeed({}));
  });
};

// Private functions

var _WebStorage_getStore = function (persist) {
  return persist ? window.localStorage : window.sessionStorage;
};
var $gren_lang$browser$WebStorage$AccessError = { $: 'AccessError' };
var $gren_lang$browser$WebStorage$NoValue = { $: 'NoValue' };
var $gren_lang$browser$WebStorage$QuotaExceeded = { $: 'QuotaExceeded' };
var $gren_lang$browser$WebStorage$ReadBlocked = { $: 'ReadBlocked' };
var $gren_lang$browser$WebStorage$WriteBlocked = { $: 'WriteBlocked' };
var $gren_lang$browser$Internal$WebStorage$set = _WebStorage_set;
var $gren_lang$browser$LocalStorage$set$ = function(key, value) {
	return A3($gren_lang$browser$Internal$WebStorage$set, true, key, value);
};
var $gren_lang$browser$LocalStorage$set = F2($gren_lang$browser$LocalStorage$set$);
var $author$project$Video$Video$skipWarningKey = 'aikido.skipVideoWarning';
var $author$project$Video$Video$update$ = function(msg, model) {
	switch (msg.$) {
		case 'Ask':
			var url = msg.a;
			return { command: $gren_lang$core$Platform$Cmd$none, model: _Utils_update(model, { prompt: $gren_lang$core$Maybe$Just({ dontAsk: false, url: url }) }) };
		case 'SetDontAsk':
			var checked = msg.a;
			return { command: $gren_lang$core$Platform$Cmd$none, model: _Utils_update(model, { prompt: $gren_lang$core$Maybe$map$(function(prompt) {
						return _Utils_update(prompt, { dontAsk: checked });
					}, model.prompt) }) };
		case 'Confirm':
			var dontAsk = $gren_lang$core$Maybe$withDefault$(false, $gren_lang$core$Maybe$map$(function ($) {
						return $.dontAsk;
					}, model.prompt));
			return { command: dontAsk ? $gren_lang$core$Task$attempt$(function(_v1) {
					return $author$project$Video$Video$Saved;
				}, $gren_lang$browser$LocalStorage$set$($author$project$Video$Video$skipWarningKey, '1')) : $gren_lang$core$Platform$Cmd$none, model: _Utils_update(model, { prompt: $gren_lang$core$Maybe$Nothing, skipWarning: model.skipWarning || dontAsk }) };
		case 'Cancel':
			return { command: $gren_lang$core$Platform$Cmd$none, model: _Utils_update(model, { prompt: $gren_lang$core$Maybe$Nothing }) };
		default:
			return { command: $gren_lang$core$Platform$Cmd$none, model: model };
	}
};
var $author$project$Video$Video$update = F2($author$project$Video$Video$update$);
var $gren_lang$browser$Browser$Navigation$replaceUrl = _Browser_replaceUrl;
var $author$project$Navigation$Navigation$replace$ = function(model, route) {
	return A2($gren_lang$browser$Browser$Navigation$replaceUrl, model.key, $author$project$Shared$Route$toHash(route));
};
var $author$project$Navigation$Navigation$replace = F2($author$project$Navigation$Navigation$replace$);
var $author$project$Root$andReplaceUrl = function(result) {
	return { command: $gren_lang$core$Platform$Cmd$batch([ result.command, $author$project$Navigation$Navigation$replace$(result.model.navigation, $author$project$Root$routeOf(result.model)) ]), model: result.model };
};
var $gren_lang$core$Maybe$andThen$ = function(callback, maybeValue) {
	if (maybeValue.$ === 'Just') {
		var value = maybeValue.a;
		return callback(value);
	} else {
		return $gren_lang$core$Maybe$Nothing;
	}
};
var $gren_lang$core$Maybe$andThen = F2($gren_lang$core$Maybe$andThen$);
var $gren_lang$core$String$foldl = _String_foldl;
var $gren_lang$core$String$pushLast = _String_pushLast;
var $gren_lang$core$String$map$ = function(fn, str) {
	return A3($gren_lang$core$String$foldl, F2(function(_char, acc) {
				return A2($gren_lang$core$String$pushLast, fn(_char), acc);
			}), '', str);
};
var $gren_lang$core$String$map = F2($gren_lang$core$String$map$);
var $gren_lang$core$String$toLower = _String_toLower;
var $gren_lang$core$String$trim = _String_trim;
var $gren_lang$core$String$pushFirst = _String_pushFirst;
var $gren_lang$core$String$fromChar = function(_char) {
	return A2($gren_lang$core$String$pushFirst, _char, '');
};
var $author$project$Shared$Grade$unaccent = function(_char) {
	return A2($gren_lang$core$String$contains, $gren_lang$core$String$fromChar(_char), 'àáâãä') ? _Utils_chr('a') : (A2($gren_lang$core$String$contains, $gren_lang$core$String$fromChar(_char), 'èéêë') ? _Utils_chr('e') : (A2($gren_lang$core$String$contains, $gren_lang$core$String$fromChar(_char), 'ìíîï') ? _Utils_chr('i') : (A2($gren_lang$core$String$contains, $gren_lang$core$String$fromChar(_char), 'òóôõö') ? _Utils_chr('o') : (A2($gren_lang$core$String$contains, $gren_lang$core$String$fromChar(_char), 'ùúûü') ? _Utils_chr('u') : (_Utils_eq(_char, _Utils_chr('ç')) ? _Utils_chr('c') : _char)))));
};
var $author$project$Shared$Grade$norm = function(text) {
	return $gren_lang$core$String$trim($gren_lang$core$String$map$($author$project$Shared$Grade$unaccent, $gren_lang$core$String$toLower(text)));
};
var $author$project$Shared$Grade$byOrder$ = function(first, second) {
	var _v0 = A2($gren_lang$core$Basics$compare, first.order, second.order);
	if (_v0.$ === 'EQ') {
		return A2($gren_lang$core$Basics$compare, $author$project$Shared$Grade$norm(first.name), $author$project$Shared$Grade$norm(second.name));
	} else {
		var other = _v0;
		return other;
	}
};
var $author$project$Shared$Grade$byOrder = F2($author$project$Shared$Grade$byOrder$);
var $gren_lang$core$Array$sortWith = _Array_sortWith;
var $author$project$Shared$Grade$listAttacks$ = function(data, waza) {
	return A2($gren_lang$core$Array$sortWith, $author$project$Shared$Grade$byOrder, $author$project$Shared$Grade$attacksOf$(data, waza));
};
var $author$project$Shared$Grade$listAttacks = F2($author$project$Shared$Grade$listAttacks$);
var $author$project$Shared$Grade$listTechniques$ = function(data, waza, attackName) {
	return $gren_lang$core$Maybe$withDefault$([  ], $gren_lang$core$Maybe$map$(function(attack) {
				return A2($gren_lang$core$Array$sortWith, $author$project$Shared$Grade$byOrder, attack.techniques);
			}, $author$project$Shared$Grade$found$(function(attack) {
					return _Utils_eq(attack.name, attackName);
				}, $author$project$Shared$Grade$attacksOf$(data, waza))));
};
var $author$project$Shared$Grade$listTechniques = F3($author$project$Shared$Grade$listTechniques$);
var $author$project$Program$Program$validLevel$ = function(data, waza, wanted) {
	var techniqueExists = F2(function(attack, name) {
			return $gren_lang$core$Array$any$(function(technique) {
					return _Utils_eq(technique.name, name);
				}, $author$project$Shared$Grade$listTechniques$(data, waza, attack));
		});
	var attackExists = function(name) {
		return $gren_lang$core$Array$any$(function(attack) {
				return _Utils_eq(attack.name, name);
			}, $author$project$Shared$Grade$listAttacks$(data, waza));
	};
	switch (wanted.$) {
		case 'Attacks':
			return $author$project$Shared$Route$Attacks;
		case 'Techniques':
			var attack = wanted.a;
			return attackExists(attack) ? $author$project$Shared$Route$Techniques(attack) : $author$project$Shared$Route$Attacks;
		default:
			var card = wanted.a;
			return (!attackExists(card.attack)) ? $author$project$Shared$Route$Attacks : (A2(techniqueExists, card.attack, card.technique) ? $author$project$Shared$Route$TechniqueCard(card) : $author$project$Shared$Route$Techniques(card.attack));
	}
};
var $author$project$Program$Program$validLevel = F3($author$project$Program$Program$validLevel$);
var $author$project$Shared$Grade$wazaOrder = [ 'Tachi waza', 'Hanmi Handachi waza', 'Suwari waza' ];
var $author$project$Root$applyRoute$ = function(route, direction, model) {
	var validWaza = $gren_lang$core$Maybe$andThen$(function(waza) {
			return $gren_lang$core$Array$member$(waza, $author$project$Shared$Grade$wazaOrder) ? $gren_lang$core$Maybe$Just(waza) : $gren_lang$core$Maybe$Nothing;
		}, route.waza);
	var data = $author$project$Root$currentData(model);
	var result = function () {
		if (validWaza.$ === 'Nothing') {
			return $author$project$Root$stay(_Utils_update(model, { screen: $author$project$Root$Home }));
		} else {
			var waza = validWaza.a;
			var _v1 = route.program;
			if (_v1.$ === 'Just') {
				var wanted = _v1.a;
				return $author$project$Root$stay(_Utils_update(model, { screen: $author$project$Root$Program({ level: $author$project$Program$Program$validLevel$(data, waza, wanted), waza: waza }) }));
			} else {
				var _v2 = model.screen;
				if (_v2.$ === 'Quiz') {
					var quiz = _v2.a;
					return _Utils_eq(quiz.waza, waza) ? $author$project$Root$stay(model) : $author$project$Root$startSession$(model, waza);
				} else {
					return $author$project$Root$startSession$(model, waza);
				}
			}
		}
	}();
	var changed = !_Utils_eq($author$project$Root$routeOf(result.model), $author$project$Root$routeOf(model));
	return { command: result.command, model: changed ? $author$project$Root$slide$(direction, result.model) : result.model };
};
var $author$project$Root$applyRoute = F3($author$project$Root$applyRoute$);
var $author$project$Root$replaceUrl = function(model) {
	return { command: $author$project$Navigation$Navigation$replace$(model.navigation, $author$project$Root$routeOf(model)), model: model };
};
var $author$project$Catalog$Catalog$select$ = function(id, model) {
	return $author$project$Catalog$Catalog$isKnown$(id, model) ? _Utils_update(model, { gradeId: id }) : model;
};
var $author$project$Catalog$Catalog$select = F2($author$project$Catalog$Catalog$select$);
var $author$project$Root$whenCatalogEvent$ = function(event, model) {
	if (event.$ === 'GradesReady') {
		var route = model.navigation.initialRoute;
		var selected = function () {
			var _v1 = route.grade;
			if (_v1.$ === 'Just') {
				var id = _v1.a;
				return _Utils_update(model, { catalog: $author$project$Catalog$Catalog$select$(id, model.catalog) });
			} else {
				return model;
			}
		}();
		return $author$project$Root$andReplaceUrl($author$project$Root$applyRoute$(route, $author$project$Slide$Slide$Still, selected));
	} else {
		return $author$project$Root$replaceUrl(model);
	}
};
var $author$project$Root$whenCatalogEvent = F2($author$project$Root$whenCatalogEvent$);
var $author$project$Shared$Route$depth = function(route) {
	var _v0 = route.program;
	if (_v0.$ === 'Just') {
		switch (_v0.a.$) {
			case 'Attacks':
				var _v1 = _v0.a;
				return 3;
			case 'Techniques':
				return 4;
			default:
				return 5;
		}
	} else {
		var _v2 = route.waza;
		if (_v2.$ === 'Just') {
			return 2;
		} else {
			return 1;
		}
	}
};
var $author$project$Root$whenNavigationEvent$ = function(event, model) {
	var route = event.a;
	if ((!_Utils_eq(model.catalog.status, $author$project$Catalog$Catalog$Ready)) || _Utils_eq(route, $author$project$Root$routeOf(model))) {
		return $author$project$Root$stay(model);
	} else {
		var direction = (_Utils_cmp($author$project$Shared$Route$depth(route), $author$project$Shared$Route$depth($author$project$Root$routeOf(model))) < 0) ? $author$project$Slide$Slide$Back : $author$project$Slide$Slide$Forward;
		return $author$project$Root$andReplaceUrl($author$project$Root$applyRoute$(route, direction, model));
	}
};
var $author$project$Root$whenNavigationEvent = F2($author$project$Root$whenNavigationEvent$);
var $author$project$Video$Video$Ask = function (a) {
	return { $: 'Ask', a: a };
};
var $author$project$Root$askVideo$ = function(url, model) {
	var result = $author$project$Video$Video$update$($author$project$Video$Video$Ask(url), model.video);
	return { command: A2($gren_lang$core$Platform$Cmd$map, $author$project$Root$VideoMsg, result.command), model: _Utils_update(model, { video: result.model }) };
};
var $author$project$Root$askVideo = F2($author$project$Root$askVideo$);
var $author$project$Root$whenProgramEvent$ = function(event, model) {
	switch (event.$) {
		case 'Moved':
			var direction = event.a;
			return $author$project$Root$pushUrl({ command: $author$project$Root$scrollTop, model: $author$project$Root$slide$(direction, model) });
		case 'Closed':
			var waza = event.a;
			return $author$project$Root$startQuiz$($author$project$Slide$Slide$Back, waza, model);
		case 'HomeRequested':
			return $author$project$Root$goHome(model);
		default:
			var url = event.a;
			return $author$project$Root$askVideo$(url, model);
	}
};
var $author$project$Root$whenProgramEvent = F2($author$project$Root$whenProgramEvent$);
var $author$project$Program$Program$init = function(waza) {
	return { level: $author$project$Shared$Route$Attacks, waza: waza };
};
var $author$project$Root$whenQuizEvent$ = function(event, model) {
	switch (event.$) {
		case 'CardChanged':
			return { command: $author$project$Root$scrollTop, model: $author$project$Root$slide$($author$project$Slide$Slide$Forward, model) };
		case 'HomeRequested':
			return $author$project$Root$goHome(model);
		case 'ProgramRequested':
			var waza = event.a;
			return $author$project$Root$pushUrl({ command: $author$project$Root$scrollTop, model: $author$project$Root$slide$($author$project$Slide$Slide$Forward, _Utils_update(model, { screen: $author$project$Root$Program($author$project$Program$Program$init(waza)) })) });
		default:
			var url = event.a;
			return $author$project$Root$askVideo$(url, model);
	}
};
var $author$project$Root$whenQuizEvent = F2($author$project$Root$whenQuizEvent$);
var $author$project$Root$update$ = function(msg, model) {
	switch (msg.$) {
		case 'CatalogMsg':
			var catalogMsg = msg.a;
			var result = $author$project$Catalog$Catalog$update$(catalogMsg, model.catalog);
			return $author$project$Root$applyEvents$($author$project$Root$whenCatalogEvent, result.events, { command: A2($gren_lang$core$Platform$Cmd$map, $author$project$Root$CatalogMsg, result.command), model: _Utils_update(model, { catalog: result.model }) });
		case 'StartSession':
			var waza = msg.a;
			return $author$project$Root$startQuiz$($author$project$Slide$Slide$Forward, waza, model);
		case 'QuizMsg':
			var quizMsg = msg.a;
			var _v1 = model.screen;
			if (_v1.$ === 'Quiz') {
				var quiz = _v1.a;
				var result = $author$project$Quiz$Quiz$update$(quizMsg, quiz);
				return $author$project$Root$applyEvents$($author$project$Root$whenQuizEvent, result.events, { command: A2($gren_lang$core$Platform$Cmd$map, $author$project$Root$QuizMsg, result.command), model: _Utils_update(model, { screen: $author$project$Root$Quiz(result.model) }) });
			} else {
				return $author$project$Root$stay(model);
			}
		case 'ProgramMsg':
			var programMsg = msg.a;
			var _v2 = model.screen;
			if (_v2.$ === 'Program') {
				var program = _v2.a;
				var result = $author$project$Program$Program$update$(programMsg, program);
				return $author$project$Root$applyEvents$($author$project$Root$whenProgramEvent, result.events, { command: A2($gren_lang$core$Platform$Cmd$map, $author$project$Root$ProgramMsg, result.command), model: _Utils_update(model, { screen: $author$project$Root$Program(result.model) }) });
			} else {
				return $author$project$Root$stay(model);
			}
		case 'GoHome':
			return $author$project$Root$goHome(model);
		case 'NavigationMsg':
			var navigationMsg = msg.a;
			var result = $author$project$Navigation$Navigation$update$(navigationMsg, model.navigation);
			return $author$project$Root$applyEvents$($author$project$Root$whenNavigationEvent, result.events, { command: A2($gren_lang$core$Platform$Cmd$map, $author$project$Root$NavigationMsg, result.command), model: _Utils_update(model, { navigation: result.model }) });
		case 'VideoMsg':
			var videoMsg = msg.a;
			var result = $author$project$Video$Video$update$(videoMsg, model.video);
			return { command: A2($gren_lang$core$Platform$Cmd$map, $author$project$Root$VideoMsg, result.command), model: _Utils_update(model, { video: result.model }) };
		default:
			return $author$project$Root$stay(model);
	}
};
var $author$project$Root$update = F2($author$project$Root$update$);
var $gren_lang$browser$VirtualDom$map = _VirtualDom_map;
var $gren_lang$browser$Html$map = $gren_lang$browser$VirtualDom$map;
var $author$project$Video$Video$Cancel = { $: 'Cancel' };
var $author$project$Video$Video$Confirm = { $: 'Confirm' };
var $author$project$Video$Video$SetDontAsk = function (a) {
	return { $: 'SetDontAsk', a: a };
};
var $gren_lang$browser$VirtualDom$node = function(tag) {
	return _VirtualDom_node(_VirtualDom_noScript(tag));
};
var $gren_lang$browser$Html$node = $gren_lang$browser$VirtualDom$node;
var $gren_lang$browser$Html$a = $gren_lang$browser$Html$node('a');
var $gren_lang$browser$VirtualDom$attribute$ = function(key, value) {
	return A2(_VirtualDom_attribute, _VirtualDom_noOnOrFormAction(key), _VirtualDom_noJavaScriptOrHtmlUri(value));
};
var $gren_lang$browser$VirtualDom$attribute = F2($gren_lang$browser$VirtualDom$attribute$);
var $gren_lang$browser$Html$Attributes$attribute = $gren_lang$browser$VirtualDom$attribute;
var $gren_lang$browser$Html$button = $gren_lang$browser$Html$node('button');
var $gren_lang$core$Json$Encode$bool = _Json_wrap;
var $gren_lang$browser$VirtualDom$property$ = function(key, value) {
	return A2(_VirtualDom_property, _VirtualDom_noInnerHtmlOrFormAction(key), _VirtualDom_noJavaScriptOrHtmlUri(value));
};
var $gren_lang$browser$VirtualDom$property = F2($gren_lang$browser$VirtualDom$property$);
var $gren_lang$browser$Html$Attributes$property = $gren_lang$browser$VirtualDom$property;
var $gren_lang$browser$Html$Attributes$boolProperty$ = function(key, bool) {
	return A2($gren_lang$browser$Html$Attributes$property, key, $gren_lang$core$Json$Encode$bool(bool));
};
var $gren_lang$browser$Html$Attributes$boolProperty = F2($gren_lang$browser$Html$Attributes$boolProperty$);
var $gren_lang$browser$Html$Attributes$checked = $gren_lang$browser$Html$Attributes$boolProperty('checked');
var $gren_lang$core$Json$Encode$string = _Json_wrap;
var $gren_lang$browser$Html$Attributes$stringProperty$ = function(key, string) {
	return A2($gren_lang$browser$Html$Attributes$property, key, $gren_lang$core$Json$Encode$string(string));
};
var $gren_lang$browser$Html$Attributes$stringProperty = F2($gren_lang$browser$Html$Attributes$stringProperty$);
var $gren_lang$browser$Html$Attributes$class = $gren_lang$browser$Html$Attributes$stringProperty('className');
var $gren_lang$browser$Html$div = $gren_lang$browser$Html$node('div');
var $gren_lang$browser$Html$Attributes$href = function(url) {
	return $gren_lang$browser$Html$Attributes$stringProperty$('href', url);
};
var $gren_lang$browser$Html$Attributes$id = $gren_lang$browser$Html$Attributes$stringProperty('id');
var $gren_lang$browser$Html$input = $gren_lang$browser$Html$node('input');
var $gren_lang$browser$Html$label = $gren_lang$browser$Html$node('label');
var $gren_lang$browser$VirtualDom$Normal = function (a) {
	return { $: 'Normal', a: a };
};
var $gren_lang$browser$VirtualDom$on = _VirtualDom_on;
var $gren_lang$browser$Html$Events$on$ = function(event, decoder) {
	return A2($gren_lang$browser$VirtualDom$on, event, $gren_lang$browser$VirtualDom$Normal(decoder));
};
var $gren_lang$browser$Html$Events$on = F2($gren_lang$browser$Html$Events$on$);
var $gren_lang$core$Array$foldr = _Array_foldr;
var $gren_lang$core$Json$Decode$at$ = function(fields, decoder) {
	return A3($gren_lang$core$Array$foldr, $gren_lang$core$Json$Decode$field, decoder, fields);
};
var $gren_lang$core$Json$Decode$at = F2($gren_lang$core$Json$Decode$at$);
var $gren_lang$browser$Html$Events$targetChecked = $gren_lang$core$Json$Decode$at$([ 'target', 'checked' ], $gren_lang$core$Json$Decode$bool);
var $gren_lang$browser$Html$Events$onCheck = function(tagger) {
	return $gren_lang$browser$Html$Events$on$('change', A2($gren_lang$core$Json$Decode$map, tagger, $gren_lang$browser$Html$Events$targetChecked));
};
var $gren_lang$browser$Html$Events$onClick = function(msg) {
	return $gren_lang$browser$Html$Events$on$('click', $gren_lang$core$Json$Decode$succeed(msg));
};
var $gren_lang$browser$Html$p = $gren_lang$browser$Html$node('p');
var $gren_lang$browser$Html$Attributes$rel = $gren_lang$browser$Html$Attributes$attribute('rel');
var $gren_lang$browser$Html$Attributes$target = $gren_lang$browser$Html$Attributes$stringProperty('target');
var $gren_lang$browser$VirtualDom$text = _VirtualDom_text;
var $gren_lang$browser$Html$text = $gren_lang$browser$VirtualDom$text;
var $gren_lang$browser$Html$Attributes$type_ = $gren_lang$browser$Html$Attributes$stringProperty('type');
var $author$project$Video$View$modal = function(model) {
	var _v0 = model.prompt;
	if (_v0.$ === 'Nothing') {
		return $gren_lang$browser$Html$text('');
	} else {
		var prompt = _v0.a;
		return A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$id('video-modal'), $gren_lang$browser$Html$Attributes$class('modal-backdrop') ], [ A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$class('modal'), A2($gren_lang$browser$Html$Attributes$attribute, 'role', 'dialog'), A2($gren_lang$browser$Html$Attributes$attribute, 'aria-modal', 'true'), A2($gren_lang$browser$Html$Attributes$attribute, 'aria-labelledby', 'video-modal-text') ], [ A2($gren_lang$browser$Html$p, [ $gren_lang$browser$Html$Attributes$id('video-modal-text') ], [ $gren_lang$browser$Html$text('Attention la technique de la vidéo n\'est peut-être pas exactement celle attendue lors de votre passage. Voulez-vous vraiment aller voir cette vidéo ?') ]), A2($gren_lang$browser$Html$label, [ $gren_lang$browser$Html$Attributes$class('field') ], [ A2($gren_lang$browser$Html$input, [ $gren_lang$browser$Html$Attributes$type_('checkbox'), $gren_lang$browser$Html$Attributes$id('video-dont-ask'), $gren_lang$browser$Html$Attributes$checked(prompt.dontAsk), $gren_lang$browser$Html$Events$onCheck($author$project$Video$Video$SetDontAsk) ], [  ]), $gren_lang$browser$Html$text(' Ne plus afficher ce message') ]), A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$class('buttons') ], [ A2($gren_lang$browser$Html$a, [ $gren_lang$browser$Html$Attributes$id('video-confirm'), $gren_lang$browser$Html$Attributes$class('button'), $gren_lang$browser$Html$Attributes$href(prompt.url), $gren_lang$browser$Html$Attributes$target('_blank'), $gren_lang$browser$Html$Attributes$rel('noopener'), $gren_lang$browser$Html$Events$onClick($author$project$Video$Video$Confirm) ], [ $gren_lang$browser$Html$text('Voir la vidéo') ]), A2($gren_lang$browser$Html$button, [ $gren_lang$browser$Html$Attributes$id('video-cancel'), $gren_lang$browser$Html$Attributes$class('secondary'), $gren_lang$browser$Html$Events$onClick($author$project$Video$Video$Cancel) ], [ $gren_lang$browser$Html$text('Annuler') ]) ]) ]) ]);
	}
};
var $gren_lang$browser$Html$main_ = $gren_lang$browser$Html$node('main');
var $gren_lang$browser$Html$footer = $gren_lang$browser$Html$node('footer');
var $author$project$Layout$Page$pageFooter = A2($gren_lang$browser$Html$footer, [  ], [ A2($gren_lang$browser$Html$p, [  ], [ $gren_lang$browser$Html$text('© 2026 Aïkido Trainer. Tous droits réservés.') ]), A2($gren_lang$browser$Html$p, [  ], [ $gren_lang$browser$Html$text('Développé par amour de l\'Aïkido 🙏') ]), A2($gren_lang$browser$Html$p, [  ], [ A2($gren_lang$browser$Html$a, [ $gren_lang$browser$Html$Attributes$href('manual.html') ], [ $gren_lang$browser$Html$text('Manuel d\'utilisation') ]) ]) ]);
var $author$project$Layout$Page$page$ = function(videoModal, content) {
	return A2($gren_lang$browser$Html$main_, [  ], A2($gren_lang$core$Array$prepend, content, [ $author$project$Layout$Page$pageFooter, videoModal ]));
};
var $author$project$Layout$Page$page = F2($author$project$Layout$Page$page$);
var $author$project$View$page$ = function(model, content) {
	return $author$project$Layout$Page$page$(A2($gren_lang$browser$Html$map, $author$project$Root$VideoMsg, $author$project$Video$View$modal(model.video)), content);
};
var $author$project$View$page = F2($author$project$View$page$);
var $author$project$View$context = function(model) {
	return { data: $author$project$Root$currentData(model), skipVideoWarning: model.video.skipWarning, slide: model.slide };
};
var $author$project$Catalog$View$failed = function(message) {
	return A2($gren_lang$browser$Html$p, [ $gren_lang$browser$Html$Attributes$class('hint') ], [ $gren_lang$browser$Html$text(message) ]);
};
var $author$project$Root$StartSession = function (a) {
	return { $: 'StartSession', a: a };
};
var $gren_lang$browser$Html$Attributes$disabled = $gren_lang$browser$Html$Attributes$boolProperty('disabled');
var $author$project$Quiz$View$picker$ = function(data, filters, onPick) {
	var isEmpty = function(waza) {
		return $gren_lang$core$Array$isEmpty($author$project$Shared$Grade$buildPool$(data, waza, filters));
	};
	var anyEmpty = $gren_lang$core$Array$any$(isEmpty, $author$project$Shared$Grade$wazaOrder);
	return A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$class('group grow') ], [ A2($gren_lang$browser$Html$p, [ $gren_lang$browser$Html$Attributes$class('hint') ], [ $gren_lang$browser$Html$text('Choisis un waza et teste-toi !') ]), A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$id('waza-buttons'), $gren_lang$browser$Html$Attributes$class('buttons grow') ], A2($gren_lang$core$Array$map, function(waza) {
					return A2($gren_lang$browser$Html$button, [ $gren_lang$browser$Html$Attributes$disabled(isEmpty(waza)), $gren_lang$browser$Html$Events$onClick(onPick(waza)) ], [ $gren_lang$browser$Html$text(waza) ]);
				}, $author$project$Shared$Grade$wazaOrder)), A2($gren_lang$browser$Html$p, [ $gren_lang$browser$Html$Attributes$id('home-msg'), $gren_lang$browser$Html$Attributes$class('hint') ], [ $gren_lang$browser$Html$text(anyEmpty ? 'Un waza grisé n\'a aucune technique pour ces filtres.' : '') ]) ]);
};
var $author$project$Quiz$View$picker = F3($author$project$Quiz$View$picker$);
var $gren_lang$browser$Html$section = $gren_lang$browser$Html$node('section');
var $author$project$Catalog$Catalog$FilterNew = function (a) {
	return { $: 'FilterNew', a: a };
};
var $author$project$Catalog$Catalog$FilterWarning = function (a) {
	return { $: 'FilterWarning', a: a };
};
var $author$project$Catalog$Catalog$SelectGrade = function (a) {
	return { $: 'SelectGrade', a: a };
};
var $gren_lang$browser$Html$Events$alwaysStop = function(msg) {
	return { message: msg, stopPropagation: true };
};
var $gren_lang$browser$VirtualDom$MayStopPropagation = function (a) {
	return { $: 'MayStopPropagation', a: a };
};
var $gren_lang$browser$Html$Events$stopPropagationOn$ = function(event, decoder) {
	return A2($gren_lang$browser$VirtualDom$on, event, $gren_lang$browser$VirtualDom$MayStopPropagation(decoder));
};
var $gren_lang$browser$Html$Events$stopPropagationOn = F2($gren_lang$browser$Html$Events$stopPropagationOn$);
var $gren_lang$browser$Html$Events$targetValue = $gren_lang$core$Json$Decode$at$([ 'target', 'value' ], $gren_lang$core$Json$Decode$string);
var $gren_lang$browser$Html$Events$onInput = function(tagger) {
	return $gren_lang$browser$Html$Events$stopPropagationOn$('input', A2($gren_lang$core$Json$Decode$map, $gren_lang$browser$Html$Events$alwaysStop, A2($gren_lang$core$Json$Decode$map, tagger, $gren_lang$browser$Html$Events$targetValue)));
};
var $gren_lang$browser$Html$option = $gren_lang$browser$Html$node('option');
var $gren_lang$browser$Html$select = $gren_lang$browser$Html$node('select');
var $gren_lang$browser$Html$Attributes$selected = $gren_lang$browser$Html$Attributes$boolProperty('selected');
var $gren_lang$browser$Html$Attributes$value = $gren_lang$browser$Html$Attributes$stringProperty('value');
var $author$project$Catalog$View$view = function(model) {
	return A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$class('group settings') ], [ A2($gren_lang$browser$Html$label, [ $gren_lang$browser$Html$Attributes$class('field') ], [ $gren_lang$browser$Html$text('Grade'), A2($gren_lang$browser$Html$select, [ $gren_lang$browser$Html$Attributes$id('grade'), $gren_lang$browser$Html$Events$onInput($author$project$Catalog$Catalog$SelectGrade) ], A2($gren_lang$core$Array$map, function(grade) {
						return A2($gren_lang$browser$Html$option, [ $gren_lang$browser$Html$Attributes$value(grade.info.id), $gren_lang$browser$Html$Attributes$selected(_Utils_eq(grade.info.id, model.gradeId)) ], [ $gren_lang$browser$Html$text(grade.info.label + (' (' + ($gren_lang$core$String$fromInt(grade.count) + ' techniques)'))) ]);
					}, model.grades)) ]), A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$class('filters') ], [ A2($gren_lang$browser$Html$label, [  ], [ A2($gren_lang$browser$Html$input, [ $gren_lang$browser$Html$Attributes$type_('checkbox'), $gren_lang$browser$Html$Attributes$id('f-new'), $gren_lang$browser$Html$Attributes$checked(model.filters.isNew), $gren_lang$browser$Html$Events$onCheck($author$project$Catalog$Catalog$FilterNew) ], [  ]), $gren_lang$browser$Html$text(' 🆕 Nouveautés') ]), A2($gren_lang$browser$Html$label, [  ], [ A2($gren_lang$browser$Html$input, [ $gren_lang$browser$Html$Attributes$type_('checkbox'), $gren_lang$browser$Html$Attributes$id('f-warning'), $gren_lang$browser$Html$Attributes$checked(model.filters.isWarning), $gren_lang$browser$Html$Events$onCheck($author$project$Catalog$Catalog$FilterWarning) ], [  ]), $gren_lang$browser$Html$text(' ⚠️ Attention') ]) ]) ]);
};
var $author$project$View$homeView = function(model) {
	return A2($gren_lang$browser$Html$section, [ $gren_lang$browser$Html$Attributes$id('home') ], [ A2($gren_lang$browser$Html$map, $author$project$Root$CatalogMsg, $author$project$Catalog$View$view(model.catalog)), $author$project$Quiz$View$picker$($author$project$Root$currentData(model), model.catalog.filters, $author$project$Root$StartSession) ]);
};
var $author$project$Catalog$View$loading = A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$id('loading'), $gren_lang$browser$Html$Attributes$class('loading'), A2($gren_lang$browser$Html$Attributes$attribute, 'role', 'status'), A2($gren_lang$browser$Html$Attributes$attribute, 'aria-label', 'Chargement') ], [ A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$class('spinner') ], [  ]) ]);
var $author$project$Root$GoHome = { $: 'GoHome' };
var $gren_lang$browser$Html$h1 = $gren_lang$browser$Html$node('h1');
var $author$project$Layout$Page$title = function(onClick) {
	return A2($gren_lang$browser$Html$h1, [ $gren_lang$browser$Html$Attributes$id('title'), $gren_lang$browser$Html$Events$onClick(onClick) ], [ $gren_lang$browser$Html$text('合気道 Aïkido') ]);
};
var $author$project$View$title = $author$project$Layout$Page$title($author$project$Root$GoHome);
var $author$project$Program$Program$AskVideo = function (a) {
	return { $: 'AskVideo', a: a };
};
var $author$project$Program$Program$GoHome = { $: 'GoHome' };
var $gren_lang$browser$Html$h2 = $gren_lang$browser$Html$node('h2');
var $author$project$Program$Program$Close = { $: 'Close' };
var $author$project$Program$Program$Navigate = function (a) {
	return { $: 'Navigate', a: a };
};
var $author$project$Shared$Grade$findSameTechnique$ = function(data, waza, attackName, techniqueName) {
	return A2($gren_lang$core$Array$mapAndFlatten, function(other) {
			return A2($gren_lang$core$Array$map, function(technique) {
					return { attack: other.name, technique: technique };
				}, A2($gren_lang$core$Array$keepIf, function(technique) {
						return _Utils_eq($author$project$Shared$Grade$norm(technique.name), $author$project$Shared$Grade$norm(techniqueName));
					}, other.techniques));
		}, A2($gren_lang$core$Array$keepIf, function(other) {
				return !_Utils_eq(other.name, attackName);
			}, $author$project$Shared$Grade$attacksOf$(data, waza)));
};
var $author$project$Shared$Grade$findSameTechnique = F4($author$project$Shared$Grade$findSameTechnique$);
var $gren_lang$core$Basics$idiv = _Basics_idiv;
var $author$project$Program$View$item$ = function(label, target) {
	return A2($gren_lang$browser$Html$button, [ $gren_lang$browser$Html$Attributes$class('item'), $gren_lang$browser$Html$Events$onClick($author$project$Program$Program$Navigate({ direction: $gren_lang$core$Maybe$Nothing, to: target })) ], [ $gren_lang$browser$Html$text(label) ]);
};
var $author$project$Program$View$item = F2($author$project$Program$View$item$);
var $author$project$Shared$Grade$badgesOf = function(technique) {
	return $gren_lang$core$String$trim(A2($gren_lang$core$String$join, ' ', [ technique.isNew ? '🆕' : '', technique.isWarning ? '⚠️' : '' ]));
};
var $author$project$Program$View$withBadges$ = function(label, technique) {
	return $gren_lang$core$String$trim(label + (' ' + $author$project$Shared$Grade$badgesOf(technique)));
};
var $author$project$Program$View$withBadges = F2($author$project$Program$View$withBadges$);
var $author$project$Program$View$levelOf$ = function(data, program) {
	var waza = program.waza;
	var _v0 = program.level;
	switch (_v0.$) {
		case 'Attacks':
			var attacks = $author$project$Shared$Grade$listAttacks$(data, waza);
			return { actions: $gren_lang$core$Maybe$Nothing, back: '← Tirage', backMessage: $author$project$Program$Program$Close, fields: { attack: '', technique: '', waza: waza }, items: A2($gren_lang$core$Array$map, function(attack) {
					return $author$project$Program$View$item$(attack.name, $author$project$Shared$Route$Techniques(attack.name));
				}, attacks), sub: $gren_lang$core$String$fromInt($gren_lang$core$Array$length(attacks)) + ' attaques', title: 'Choisis une attaque :' };
		case 'Techniques':
			var attack = _v0.a;
			var techniques = $author$project$Shared$Grade$listTechniques$(data, waza, attack);
			return { actions: $gren_lang$core$Maybe$Nothing, back: '← Programme', backMessage: $author$project$Program$Program$Navigate({ direction: $gren_lang$core$Maybe$Nothing, to: $author$project$Shared$Route$Attacks }), fields: { attack: attack, technique: '', waza: waza }, items: A2($gren_lang$core$Array$map, function(technique) {
					return $author$project$Program$View$item$($author$project$Program$View$withBadges$(technique.name, technique), $author$project$Shared$Route$TechniqueCard({ attack: attack, technique: technique.name }));
				}, techniques), sub: $gren_lang$core$String$fromInt($gren_lang$core$Array$length(techniques)) + ' techniques', title: 'Choisis une technique :' };
		default:
			var selected = _v0.a;
			var siblings = $author$project$Shared$Grade$listTechniques$(data, waza, selected.attack);
			var position = $gren_lang$core$Maybe$withDefault$(0, $gren_lang$core$Maybe$map$(function(found) {
						return found.value.index;
					}, A2($gren_lang$core$Array$findFirst, function(entry) {
							return _Utils_eq(entry.name, selected.technique);
						}, A2($gren_lang$core$Array$indexedMap, F2(function(index, technique) {
									return { index: index, name: technique.name };
								}), siblings))));
			var pagerButton = F4(function(buttonId, label, target, direction) {
					return A2($gren_lang$browser$Html$button, A2($gren_lang$core$Array$prepend, [ $gren_lang$browser$Html$Attributes$id(buttonId), $gren_lang$browser$Html$Attributes$disabled(_Utils_eq(target, $gren_lang$core$Maybe$Nothing)) ], function () {
								if (target.$ === 'Just') {
									var technique = target.a;
									return [ $gren_lang$browser$Html$Events$onClick($author$project$Program$Program$Navigate({ direction: $gren_lang$core$Maybe$Just(direction), to: $author$project$Shared$Route$TechniqueCard({ attack: selected.attack, technique: technique.name }) })) ];
								} else {
									return [  ];
								}
							}()), [ $gren_lang$browser$Html$text(label) ]);
				});
			var others = $author$project$Shared$Grade$findSameTechnique$(data, waza, selected.attack, selected.technique);
			var count = $gren_lang$core$Array$length(siblings);
			var neighbour = function(step) {
				return (count > 1) ? A2($gren_lang$core$Array$get, ((position + step) + count) - (count * ((((position + step) + count) / count) | 0)), siblings) : $gren_lang$core$Maybe$Nothing;
			};
			return { actions: $gren_lang$core$Maybe$Just(A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$class('pager') ], [ A2($gren_lang$browser$Html$p, [ $gren_lang$browser$Html$Attributes$class('hint center') ], [ $gren_lang$browser$Html$text($gren_lang$core$String$fromInt(position + 1) + (' / ' + $gren_lang$core$String$fromInt(count))) ]), A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$class('pager-buttons') ], [ A4(pagerButton, 'prog-prev', 'Précédente', neighbour(-1), $author$project$Slide$Slide$Back), A4(pagerButton, 'prog-next', 'Suivante', neighbour(1), $author$project$Slide$Slide$Forward) ]) ])), back: '← ' + selected.attack, backMessage: $author$project$Program$Program$Navigate({ direction: $gren_lang$core$Maybe$Nothing, to: $author$project$Shared$Route$Techniques(selected.attack) }), fields: { attack: selected.attack, technique: selected.technique, waza: waza }, items: A2($gren_lang$core$Array$map, function(other) {
					return $author$project$Program$View$item$($author$project$Program$View$withBadges$(other.attack, other.technique), $author$project$Shared$Route$TechniqueCard({ attack: other.attack, technique: other.technique.name }));
				}, others), sub: $gren_lang$core$Array$isEmpty(others) ? 'Aucune autre attaque pour cette technique.' : '', title: 'Même technique, autres attaques ↓' };
	}
};
var $author$project$Program$View$levelOf = F2($author$project$Program$View$levelOf$);
var $gren_lang$core$Array$singleton = function(a) {
	return [ a ];
};
var $gren_lang$browser$VirtualDom$MayPreventDefault = function (a) {
	return { $: 'MayPreventDefault', a: a };
};
var $gren_lang$browser$Html$Events$preventDefaultOn$ = function(event, decoder) {
	return A2($gren_lang$browser$VirtualDom$on, event, $gren_lang$browser$VirtualDom$MayPreventDefault(decoder));
};
var $gren_lang$browser$Html$Events$preventDefaultOn = F2($gren_lang$browser$Html$Events$preventDefaultOn$);
var $author$project$Video$View$anchor$ = function(config, anchorId, url) {
	var attributes = [ $gren_lang$browser$Html$Attributes$id(anchorId), $gren_lang$browser$Html$Attributes$class('video'), $gren_lang$browser$Html$Attributes$href(url), $gren_lang$browser$Html$Attributes$target('_blank'), $gren_lang$browser$Html$Attributes$rel('noopener') ];
	return A2($gren_lang$browser$Html$a, config.skipWarning ? attributes : $gren_lang$core$Array$pushLast$($gren_lang$browser$Html$Events$preventDefaultOn$('click', $gren_lang$core$Json$Decode$succeed({ message: config.onAsk(url), preventDefault: true })), attributes), [ $gren_lang$browser$Html$text('▶ Voir la vidéo') ]);
};
var $author$project$Video$View$anchor = F3($author$project$Video$View$anchor$);
var $author$project$Shared$Grade$findTechnique$ = function(data, waza, attackName, techniqueName) {
	return $gren_lang$core$Maybe$andThen$(function(attack) {
			return $author$project$Shared$Grade$found$(function(technique) {
					return _Utils_eq(technique.name, techniqueName);
				}, attack.techniques);
		}, $author$project$Shared$Grade$found$(function(attack) {
				return _Utils_eq(attack.name, attackName);
			}, $author$project$Shared$Grade$attacksOf$(data, waza)));
};
var $author$project$Shared$Grade$findTechnique = F4($author$project$Shared$Grade$findTechnique$);
var $gren_lang$browser$VirtualDom$keyedNode = function(tag) {
	return _VirtualDom_keyedNode(_VirtualDom_noScript(tag));
};
var $gren_lang$browser$Html$Keyed$node = $gren_lang$browser$VirtualDom$keyedNode;
var $gren_lang$browser$VirtualDom$style = _VirtualDom_style;
var $gren_lang$browser$Html$Attributes$style = $gren_lang$browser$VirtualDom$style;
var $author$project$Layout$Card$view$ = function(context, onAskVideo, fields) {
	var slideClass = function () {
		var _v2 = context.slide.direction;
		switch (_v2.$) {
			case 'Back':
				return ' slide-back';
			case 'Forward':
				return ' slide-forward';
			default:
				return '';
		}
	}();
	var found = (fields.technique === '') ? $gren_lang$core$Maybe$Nothing : $author$project$Shared$Grade$findTechnique$(context.data, fields.waza, fields.attack, fields.technique);
	var videoLink = function () {
		var _v1 = $gren_lang$core$Maybe$andThen$(function ($) {
				return $.video;
			}, found);
		if (_v1.$ === 'Just') {
			var url = _v1.a;
			return [ $author$project$Video$View$anchor$({ onAsk: onAskVideo, skipWarning: context.skipVideoWarning }, fields.prefix + '-video', url) ];
		} else {
			return [  ];
		}
	}();
	var formText = function () {
		var _v0 = fields.form;
		if (_v0.$ === 'Just') {
			var form = _v0.a;
			return form;
		} else {
			return $gren_lang$core$Maybe$withDefault$('', $gren_lang$core$Maybe$map$(function(technique) {
						return A2($gren_lang$core$String$join, ' · ', technique.forms);
					}, found));
		}
	}();
	var cell = F3(function(suffix, name, content) {
			return A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$id(fields.prefix + ('-' + suffix)), $gren_lang$browser$Html$Attributes$class(name) ], [ $gren_lang$browser$Html$text(content) ]);
		});
	return A3($gren_lang$browser$Html$Keyed$node, 'div', [ A2($gren_lang$browser$Html$Attributes$style, 'display', 'contents') ], [ { key: $gren_lang$core$String$fromInt(context.slide.count), node: A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$id(fields.id), $gren_lang$browser$Html$Attributes$class('card' + slideClass) ], A2($gren_lang$core$Array$prepend, [ A3(cell, 'waza', 'waza', fields.waza), A3(cell, 'attack', 'attack', fields.attack), A3(cell, 'technique', 'technique', fields.technique), A3(cell, 'form', 'form', formText), A3(cell, 'badges', 'badges', $gren_lang$core$Maybe$withDefault$('', $gren_lang$core$Maybe$map$($author$project$Shared$Grade$badgesOf, found))), A3(cell, 'note', 'note', $gren_lang$core$Maybe$withDefault$('', $gren_lang$core$Maybe$andThen$(function ($) {
								return $.note;
							}, found))) ], videoLink)) } ]);
};
var $author$project$Layout$Card$view = F3($author$project$Layout$Card$view$);
var $author$project$Program$View$view$ = function(context, program) {
	var level = $author$project$Program$View$levelOf$(context.data, program);
	return A2($gren_lang$browser$Html$section, [ $gren_lang$browser$Html$Attributes$id('program') ], [ A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$class(_Utils_eq(level.actions, $gren_lang$core$Maybe$Nothing) ? 'screen' : 'screen full') ], A2($gren_lang$core$Array$prepend, [ $author$project$Layout$Page$title($author$project$Program$Program$GoHome), A2($gren_lang$browser$Html$button, [ $gren_lang$browser$Html$Attributes$id('home-btn'), $gren_lang$browser$Html$Attributes$class('secondary'), $gren_lang$browser$Html$Events$onClick($author$project$Program$Program$GoHome) ], [ $gren_lang$browser$Html$text('Retour à l\'accueil') ]), A2($gren_lang$browser$Html$button, [ $gren_lang$browser$Html$Attributes$id('prog-back'), $gren_lang$browser$Html$Attributes$class('secondary back'), $gren_lang$browser$Html$Events$onClick(level.backMessage) ], [ $gren_lang$browser$Html$text(level.back) ]), $author$project$Layout$Card$view$(context, $author$project$Program$Program$AskVideo, { attack: level.fields.attack, form: $gren_lang$core$Maybe$Nothing, id: 'prog-card', prefix: 'prog', technique: level.fields.technique, waza: level.fields.waza }) ], A2($gren_lang$core$Array$prepend, $gren_lang$core$Maybe$withDefault$([  ], $gren_lang$core$Maybe$map$($gren_lang$core$Array$singleton, level.actions)), [ A2($gren_lang$browser$Html$h2, [ $gren_lang$browser$Html$Attributes$id('prog-title') ], [ $gren_lang$browser$Html$text(level.title) ]) ]))), A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$class('group') ], [ A2($gren_lang$browser$Html$p, [ $gren_lang$browser$Html$Attributes$id('prog-sub'), $gren_lang$browser$Html$Attributes$class('hint') ], [ $gren_lang$browser$Html$text(level.sub) ]), A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$id('prog-list'), $gren_lang$browser$Html$Attributes$class('buttons') ], level.items) ]) ]);
};
var $author$project$Program$View$view = F2($author$project$Program$View$view$);
var $author$project$Quiz$Quiz$AskVideo = function (a) {
	return { $: 'AskVideo', a: a };
};
var $author$project$Quiz$Quiz$GoHome = { $: 'GoHome' };
var $author$project$Quiz$Quiz$Next = { $: 'Next' };
var $author$project$Quiz$Quiz$OpenProgram = { $: 'OpenProgram' };
var $gren_lang$browser$Html$h3 = $gren_lang$browser$Html$node('h3');
var $author$project$Quiz$View$view$ = function(context, quiz) {
	var shown = function () {
		var _v0 = quiz.current;
		if (_v0.$ === 'Just') {
			var current = _v0.a;
			return { attack: current.attack, form: $gren_lang$core$Maybe$Just($gren_lang$core$Maybe$withDefault$('', current.form)), technique: current.technique, waza: quiz.waza };
		} else {
			return { attack: '', form: $gren_lang$core$Maybe$Just(''), technique: '', waza: '' };
		}
	}();
	return A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$class('screen full') ], [ $author$project$Layout$Page$title($author$project$Quiz$Quiz$GoHome), A2($gren_lang$browser$Html$section, [ $gren_lang$browser$Html$Attributes$id('quiz') ], [ A2($gren_lang$browser$Html$button, [ $gren_lang$browser$Html$Attributes$id('home-btn'), $gren_lang$browser$Html$Attributes$class('secondary'), $gren_lang$browser$Html$Events$onClick($author$project$Quiz$Quiz$GoHome) ], [ $gren_lang$browser$Html$text('Retour à l\'accueil') ]), A2($gren_lang$browser$Html$p, [ $gren_lang$browser$Html$Attributes$id('progress'), $gren_lang$browser$Html$Attributes$class('hint') ], [ $gren_lang$browser$Html$text(quiz.waza + (' : ' + ($gren_lang$core$String$fromInt(quiz.total - $gren_lang$core$Array$length(quiz.pool)) + (' / ' + $gren_lang$core$String$fromInt(quiz.total))))) ]), A2($gren_lang$browser$Html$h3, [ $gren_lang$browser$Html$Attributes$class('hint') ], [ $gren_lang$browser$Html$text('Connais-tu cette technique ?') ]), quiz.done ? A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$id('done') ], [ $gren_lang$browser$Html$text('Waza terminé 🎉') ]) : $author$project$Layout$Card$view$(context, $author$project$Quiz$Quiz$AskVideo, { attack: shown.attack, form: shown.form, id: 'card', prefix: 'card', technique: shown.technique, waza: shown.waza }), A2($gren_lang$browser$Html$div, [ $gren_lang$browser$Html$Attributes$class('buttons actions') ], A2($gren_lang$core$Array$prepend, quiz.done ? [  ] : [ A2($gren_lang$browser$Html$button, [ $gren_lang$browser$Html$Attributes$id('next'), $gren_lang$browser$Html$Events$onClick($author$project$Quiz$Quiz$Next) ], [ $gren_lang$browser$Html$text('Technique suivante') ]) ], [ A2($gren_lang$browser$Html$button, [ $gren_lang$browser$Html$Attributes$id('prog-btn'), $gren_lang$browser$Html$Attributes$class('secondary'), $gren_lang$browser$Html$Events$onClick($author$project$Quiz$Quiz$OpenProgram) ], [ $gren_lang$browser$Html$text('Voir le programme') ]) ])) ]) ]);
};
var $author$project$Quiz$View$view = F2($author$project$Quiz$View$view$);
var $author$project$View$screens = function(model) {
	var _v0 = model.catalog.status;
	switch (_v0.$) {
		case 'Loading':
			return [ $author$project$View$title, $author$project$Catalog$View$loading ];
		case 'Failed':
			var message = _v0.a;
			return [ $author$project$View$title, $author$project$Catalog$View$failed(message) ];
		default:
			var _v1 = model.screen;
			switch (_v1.$) {
				case 'Home':
					return [ $author$project$View$title, $author$project$View$homeView(model) ];
				case 'Quiz':
					var quiz = _v1.a;
					return [ A2($gren_lang$browser$Html$map, $author$project$Root$QuizMsg, $author$project$Quiz$View$view$($author$project$View$context(model), quiz)) ];
				default:
					var program = _v1.a;
					return [ A2($gren_lang$browser$Html$map, $author$project$Root$ProgramMsg, $author$project$Program$View$view$($author$project$View$context(model), program)) ];
			}
	}
};
var $author$project$View$view = function(model) {
	return { body: [ $author$project$View$page$(model, $author$project$View$screens(model)) ], title: 'Aïkido – Entraînement' };
};
var $author$project$Main$main = $gren_lang$browser$Browser$application({ init: $author$project$Root$init, onUrlChange: function(url) {
		return $author$project$Root$NavigationMsg($author$project$Navigation$Navigation$UrlChanged(url));
	}, onUrlRequest: function(request) {
		return $author$project$Root$NavigationMsg($author$project$Navigation$Navigation$UrlRequested(request));
	}, subscriptions: function(_v0) {
		return $gren_lang$core$Platform$Sub$none;
	}, update: $author$project$Root$update, view: $author$project$View$view });
_Platform_export({'Main':{'init':$author$project$Main$main(A2($gren_lang$core$Json$Decode$andThen, function(skipVideoWarning) {
			return $gren_lang$core$Json$Decode$succeed({ skipVideoWarning: skipVideoWarning });
		}, A2($gren_lang$core$Json$Decode$field, 'skipVideoWarning', $gren_lang$core$Json$Decode$bool)))}});}(this.module ? this.module.exports : this));