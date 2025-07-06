"""
toolkit/serialisers.py
====================================
Toolkit utilities for [De]-Serialising Models.
"""
import hashlib
from uuid import UUID

from django.db.models import ForeignKey, ManyToOneRel, CharField
from django.db.models.fields import DateTimeField, TimeField, DateField
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
    types = {}
    columns = []
    for f in model_instance._meta.get_fields():
        if (type(f)) == ManyToOneRel:
            pass
        else:
            if f.name in fields or fields == []:
                columns.append(f.name)
                if hasattr(f, 'verbose_name'):
                    verbose_names[f.name] = f.verbose_name
                if hasattr(f, 'help_text'):
                    if f.help_text != "":
                        help_text[f.name] = f.help_text
    return verbose_names, help_text, columns

def simple_serialiser(model_instance,jsonify=False):
    """
    @brief SERIALISE an object and return a set of json-encodable objects suitable for AJAX/JSON requests.
    ===============================
    :param model_instance: p_model_instance: The Model instance to be serialised
    :returns: r:data, verbose_names,help_text.
    """
    verbose_names, help_text, columns = model_metadata(model_instance)
    rdata = model_to_dict(model_instance)
    for key in columns:
        if type(getattr(model_instance,key)) == ForeignKey:
            name =  str(model_instance)
            rdata[key] = {"value":str(rdata[key]),"name":name}
        elif(type(rdata[key]) == UUID):
            rdata[key] = str(rdata[key])
        else:
            rdata[key] = rdata[key]
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
    verbose_names, help_text, columns = model_metadata(model_instance,fields)
    rdata = {}
    for key in columns:
        curr_val = getattr(model_instance, key)
        # print(curr_val)
        if model_instance._meta.get_field(key).is_relation:
            if curr_val:
                name = str(curr_val)
                rdata[key] = {"value": str(curr_val.pk), "name": name}
        elif type(curr_val) == UUID:
            rdata[key] = str(curr_val)
        elif type(model_instance._meta.get_field(key)) == CharField:
            print(curr_val)
            rdata[key] = curr_val
            field = model_instance._meta.get_field(key)
            # print(field.choices)
            if field.choices:
                rdata[key] = getattr(model_instance, f"get_{key}_display")()
        else:
            rdata[key] = curr_val

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


def filtered_serialiser_many(queryset, fields=[],relation_names={}):
    """
    @brief SERIALISE a queryset and return a set of json-encodable objects suitable for AJAX/JSON requests.
           based on the field names passed.
    ===============================
    :param queryset: p_model_instance: The Model instance to be serialised
    :param List: p_fields: The list of fields to fetch and serialise.
    :returns: r:data, verbose_names,help_text.
    """
    # print(fields)
    # fields += ["created"]
    verbose_names, help_text, columns = model_metadata(queryset[0], fields)
    # print(columns)
    rdata = {}
    rows = []
    for row in queryset:
        for key in columns:
            curr_val = getattr(row, key)
            curr_field = row._meta.get_field(key)
            # print(curr_val)
            if row._meta.get_field(key).is_relation:
                if curr_val:
                    if key in relation_names:
                        _name = getattr(curr_val, relation_names[key])
                        if (callable(_name)):
                            name = _name()
                        else:
                            name = str(_name)
                    else:
                        name = str(curr_val)
                    rdata[key] = {"value": str(curr_val.pk), "name": name}
            elif type(curr_val) == UUID:
                rdata[key] = str(curr_val)
            elif type(curr_field) == DateTimeField or type(curr_field) == DateField or type(curr_field) == TimeField:
                rdata[key] = str(curr_val.strftime("%Y-%m-%d %H:%M:%S"))
            elif type(curr_field) == CharField:
                # print(curr_val)
                rdata[key] = curr_val
                # print(field.choices)
                if curr_field.choices:
                    rdata[key] = getattr(row,f"get_{key}_display")()
            else:
                rdata[key] = curr_val

        # print(rdata)
        rows.append(rdata)
    return rows, verbose_names, help_text


def edit_row_serialiser(model_instance,fields=False,readonly=[]):
    filter_fields = []
    chksm = ""
    retr = []
    if fields: filter_fields = fields
    for field in model_instance._meta.fields:
        if not fields:
            filter_fields.append(field.name)
        if field.name in filter_fields:
            fieldData = {"name": field.name, "verbose_name": field.verbose_name, "help_text": field.help_text,"type":field.get_internal_type()}
            if fieldData["type"] == "UUIDField":
                fieldData["type"] = "uuid"
                fieldData["value"] = str(getattr(model_instance,field.name))
            elif fieldData["type"] == "BooleanField":
                fieldData["type"] = "boolean"
                fieldData["value"] = bool(getattr(model_instance,field.name))
            elif fieldData["type"] == "FloatField":
                fieldData["type"] = "float"
                fieldData["value"] = float(getattr(model_instance,field.name))
            elif fieldData["type"] == "IntegerField":
                fieldData["type"] = "int"
                fieldData["value"] = int(getattr(model_instance,field.name))
            elif fieldData["type"] == "DateField":
                fieldData["type"] = "date"
                fieldData["value"] = str(getattr(model_instance,field.name))
            elif fieldData["type"] == "ForeignKey":
                fieldData["type"] = "select"
                fieldData["value"] = str(getattr(model_instance,field.name))
                #fieldData["options"] =

            else:
                fieldData["type"] = "text"

                fieldData["value"] = getattr(model_instance,field.name)
            if field.name in readonly:
                fieldData["readonly"] = True
            retr.append(fieldData)
            chksm += str(getattr(model_instance,field.name))
    m = hashlib.sha512()
    m.update(chksm.encode('utf-8'))
    return retr,m.hexdigest()
