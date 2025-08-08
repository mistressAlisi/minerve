from django.http import JsonResponse


def generic_json_success(msg,**kwargs):
    rdata = {"res":"ok","msg":msg}
    if "data" in kwargs:
        rdata["data"] = kwargs["data"]
    return JsonResponse(rdata,safe=False)