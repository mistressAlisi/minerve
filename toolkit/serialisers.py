"""
toolkit/serialisers.py
====================================
Toolkit utilities for [De]-Serialising Models.
"""
from uuid import UUID

from django.forms import model_to_dict
from django.http import JsonResponse


def model_metadata(model_instance,fields=[]):
    """
    @brief Extract Verbose name and help text from models and prepare it for serialising.
    @param model_instance: The model to parse.
    @type model_instance: Any Model Instance
    @return: verbose_names,help_text
    @rtype: dict,dict
    """
    verbose_names = {}
    help_text = {}
    for f in model_instance._meta.get_fields():
        if f.name in fields or fields == []:
            if hasattr(f, 'verbose_name'):
                verbose_names[f.name] = f.verbose_name
            if hasattr(f, 'help_text'):
                if f.help_text != "":
                    help_text[f.name] = f.help_text
    return verbose_names, help_text

def simple_serialiser(model_instance,jsonify=False):
    """
    @brief SERIALISE an object and return a set of json-encodable objects suitable for AJAX/JSON requests.
    ===============================
    :param model_instance: p_model_instance: The Model instance to be serialised
    :returns: r:data, verbose_names,help_text.
    """
    verbose_names, help_text = model_metadata(model_instance)
    rdata = model_to_dict(model_instance)
    for key in rdata:
        if(type(rdata[key]) == UUID):
            rdata[key] = str(rdata[key])
    if not jsonify:
        return rdata,verbose_names, help_text
    else:
        return JsonResponse(
            {
                "res": "ok",
                "data": rdata,
                "verbose_names": verbose_names,
                "help_text": help_text,
            }, safe=False)

def filtered_serialiser(model_instance,fields=[],jsonify=False):
    """
    @brief SERIALISE an object and return a set of json-encodable objects suitable for AJAX/JSON requests.
           based on the field names passed.
    ===============================
    :param model_instance: p_model_instance: The Model instance to be serialised
    :param List: p_fields: The list of fields to fetch and serialise.
    :returns: r:data, verbose_names,help_text.
    """
    verbose_names, help_text = model_metadata(model_instance,fields)
    rdata = {}
    rdata = model_to_dict(model_instance,fields)
    for key in rdata:
        if(type(rdata[key]) == UUID):
            rdata[key] = str(rdata[key])
    if not jsonify:
        return rdata,verbose_names, help_text
    else:
        return JsonResponse(
            {
                "res": "ok",
                "data": rdata,
                "verbose_names": verbose_names,
                "help_text": help_text,
            }, safe=False)


def filtered_serialiser_many(queryset, fields=[]):
    """
    @brief SERIALISE a queryset and return a set of json-encodable objects suitable for AJAX/JSON requests.
           based on the field names passed.
    ===============================
    :param queryset: p_model_instance: The Model instance to be serialised
    :param List: p_fields: The list of fields to fetch and serialise.
    :returns: r:data, verbose_names,help_text.
    """
    verbose_names, help_text = model_metadata(queryset[0], fields)
    rdata = {}
    rows = []
    for row in queryset:
        rdata = model_to_dict(row, fields)
        rows.append(rdata)
    return rows, verbose_names, help_text