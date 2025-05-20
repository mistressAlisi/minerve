from django.http import JsonResponse


def paginator_json_response(_obj,page_size=20,form_values={}):
    """
    Generate a Paginator JSON response for metadata from the given _obj.
    @param _obj: Object iterator
    @type _obj: Any Object/QuerySet.
    @return: JSONResponse
    @rtype: JSONResponse
    """
    return JsonResponse({"res": "ok", "paginator": {"total_pages": round(_obj.count() / page_size), "current_page": 1, "total_records": _obj.count()},"values":{"data":form_values}})


def paginator_paginate_object(_obj,page=1,page_size=20):
    """
    Paginate a QuerySet _obj for paginator views
    @param _obj: Object iterator
    @type _obj: Any Object/QuerySet.
    @param page: Page Number to display, default 1.
    @type page: int
    @return: pobjs,start,end,page,total_records,total_pages,paginator_range
    @rtype: Paginated Queryset,Start Record, End Record, Page Count, Total Records, Total Pages, Paginator Range
    """
    try:
        total_records =  _obj.count()
    except TypeError:
        total_records = len(_obj)
    total_pages = round(total_records / page_size)
    if total_pages >= 2:
        paginator_range = list(range(1, total_pages + 1))
    else:
        paginator_range = [1]
    if hasattr(_obj,"created"):
        objs = _obj.order_by("created")
    else:
        objs = _obj
    if page > 1:
        start = (page-1)*page_size
    else:
        start = 0
    end = start + page_size
    pobjs = objs[start:end]

    return pobjs,start,end,page,total_records,total_pages,paginator_range