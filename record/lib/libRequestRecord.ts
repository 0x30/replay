import fetchIntercept, { FetchInterceptorResponse } from "fetch-intercept";
import { proxy, unProxy, XhrResponse } from "ajax-hook";
import { addCustomEvent } from "rrweb";

interface RequestRecord {
  // request url
  url: string;
  // 请求参数
  payload: any;
  // request method
  method: string;
  // response code
  status: number;

  // response header
  requestHeader: Record<string, any>;
  // response header
  responseHeader: Record<string, any>;
  // response 返回
  response: any;

  // resource time
  entry: PerformanceResourceTiming;
}

function isXhrResponse(
  req: XhrResponse | FetchInterceptorResponse | BodyInit
): req is XhrResponse {
  return (req as XhrResponse).config !== undefined;
}

function isFetchInterceptorResponse(
  req: XhrResponse | FetchInterceptorResponse | BodyInit
): req is FetchInterceptorResponse {
  return (req as FetchInterceptorResponse).request !== undefined;
}

const XhrResponseEncode = (resp: any) => {
  if (typeof resp === "string") return resp;
  if (resp instanceof Blob) {
    return { size: resp.size, type: resp.type };
  }
  if (resp instanceof ArrayBuffer) {
    return { byteLength: resp.byteLength };
  }
  return "unknow response";
};

const FetchResponseEncode = async (resp: FetchInterceptorResponse) => {
  const contentType = resp.headers.get("content-type");

  try {
    return await resp.clone().json();
  } catch {
    try {
      if (contentType?.startsWith("text")) return await resp.clone().text();
    } catch {
      try {
        const blob = await resp.clone().blob();
        return {
          size: blob.size,
          type: blob.type,
        };
      } catch {
        return "unknow response";
      }
    }
  }
};

const RequestBodyEncode = (body: BodyInit | null) => {
  if (body === null) return null;
  // Blob | BufferSource | FormData | URLSearchParams | string
  if (typeof body === "string") return body;
  if (body instanceof Blob) {
    return { size: body.size, type: body.type };
  }
  if (body instanceof FormData) {
    const result: Record<string, any> = {};
    body.forEach((value, key) => {
      if (value instanceof File) {
        result[key] = {
          name: value.name,
          size: value.size,
          type: value.type,
        };
      } else {
        result[key] = value;
      }
    });
    return result;
  }

  if (body instanceof ArrayBuffer) {
    return {
      byteLength: body.byteLength,
    };
  }

  return "unknow body";
};

const XhrResponse2RequestRecord = (
  resp: XhrResponse
): Partial<RequestRecord> => {
  return {
    url: resp.config.url,
    payload: RequestBodyEncode(resp.config.body),
    method: resp.config.method,
    status: resp.status,
    requestHeader: resp.config.headers,
    responseHeader: resp.headers,
    response: XhrResponseEncode(resp.response),
  };
};

const HeaderEncode = (header: Headers) => {
  const result: Record<string, string> = {};
  header.forEach((value, key) => (result[key] = value));
  return result;
};

const useRequestPool = () => {
  // 数据缓存
  const pool: Record<string, Partial<RequestRecord>> = {};

  // 设置请求
  const set = (
    urlString: string,
    request: XhrResponse | FetchInterceptorResponse | BodyInit
  ) => {
    const url = new URL(urlString).toString();

    if (isXhrResponse(request)) {
      pool[url] = XhrResponse2RequestRecord(request);
      return;
    }

    if (isFetchInterceptorResponse(request)) {
      pool[url] = {
        ...(pool[url] ?? {}),

        url: request.request.url,
        method: request.request.method,
        status: request.status,

        requestHeader: HeaderEncode(request.request.headers),
        responseHeader: HeaderEncode(request.headers),
        response: FetchResponseEncode(request),
      };
      return;
    }

    pool[url] = { payload: RequestBodyEncode(request) };
  };

  function isPromise(obj: any) {
    return (
      !!obj &&
      (typeof obj === "object" || typeof obj === "function") &&
      typeof obj.then === "function"
    );
  }

  // 补充请求，并返回请求
  const supply = async (
    url: string,
    entry: PerformanceEntry
  ): Promise<Partial<RequestRecord> | undefined> => {
    // assert entry instanceof PerformanceResourceTiming
    if (!(entry instanceof PerformanceResourceTiming)) return undefined;

    // get request
    const request = pool[url];
    if (request === undefined) return { url, entry };

    // supply
    delete pool[url];

    if (request.response && isPromise(request.response)) {
      return { ...request, entry, response: await request.response };
    }

    return { ...request, entry };
  };

  return { set, supply };
};

const { set, supply } = useRequestPool();

export const useRequestRecord = () => {
  // PerformanceObserver
  const performance = new PerformanceObserver((entryList) => {
    entryList.getEntries().forEach((entry) => {
      supply(entry.name, entry).then((req) => addCustomEvent("network", req));
    });
  });
  performance.observe({ entryTypes: ["resource"] });

  // ajax-hook
  proxy({
    onResponse(response, handler) {
      set(response.config.url, response);
      handler.next(response);
    },
  });

  const stopFetchIntercept = fetchIntercept.register({
    request(url, config) {
      set(url, config.body);
      return [url, config];
    },
    response(resp) {
      set(resp.url, resp);
      return resp;
    },
  });

  const stop = () => {
    // stop XMLHttpRequest record
    unProxy();
    // stop Fetch record
    stopFetchIntercept();
    // stop PerformanceObserver record
    performance.disconnect();
  };

  return stop;
};
