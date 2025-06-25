from django.http import JsonResponse


def generic_json_success(msg):
    return JsonResponse({"res":"ok","msg":msg},safe=False)