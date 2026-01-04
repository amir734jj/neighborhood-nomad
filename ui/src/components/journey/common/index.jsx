import React, { useEffect, useState } from "react";
import { yupExt as yup } from "../../../utilities";
import {Button, Form, FormGroup} from "react-bootstrap";
import {
  AddressAutoComplete,
  DatetimePicker,
  LoadingSimpleButton,
  SimpleButton,
  GoogleIcon, FileUpload,
} from "../..//common";
import classNames from "classnames";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensors,
  useSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import _ from "lodash";
import {DateTime} from "luxon";
import {downloadFile, uploadFile} from "../../../api";
import {ADDRESS_AUTOCOMPLETE_TYPES} from "../../../constants";

const addressSchema = yup.object({
  name: yup.string().required("Establishment name is required"),
  addressLine1: yup.string().nullable(),
  addressLine2: yup.string().nullable(),
  city: yup.string().nullable(),
  state: yup.string().nullable(),
  country: yup.string().nullable(),
  zipCode: yup.string().nullable().emptyOrNumber(),
  latitude: yup.string().nullable().emptyOrNumber(),
  longitude: yup.string().nullable().emptyOrNumber(),
});

const stopSchema = yup.object({
  description: yup.string().required("Short description is required"),
  address: addressSchema,
});

const journeySchema = yup.object({
  description: yup.string().required("Description is required for ranking-board"),
  stops: yup.array().of(stopSchema).min(1, "Minimum of 1 journey required"),
  date: yup.string().dateLessThanOrEquals(DateTime.now().endOf('day')),
  email: yup.string().email("Must be a valid email").required("Email is required for verification"),
  photos: yup.array().of(yup.string())
});

const schema = journeySchema.required();

const emptyStop = () => ({
  description: "",
  address: {
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    latitude: "",
    longitude: "",
  },
});

const SortableStop = ({id, children}) => {
  const {attributes, listeners, setNodeRef, transform, transition} =
    useSortable({id});
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}>
      {_.isFunction(children)
        ? children({attributes, listeners})
        : children}
    </div>
  );
};

export const getEmptyJourney = () => ({
  description: "",
  email: "",
  date: "",
  stops: [emptyStop()],
  photos: []
});

export const JourneyForm = ({ renderSubmit, defaultValues }) => {
  const {
    watch: formWatch,
    register: formRegister,
    control,
    handleSubmit,
    setValue,
    formState: {errors, isValid},
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues,
  });

  const {
    fields: stopFields,
    append: appendStop,
    remove: removeStop,
    move,
  } = useFieldArray({
    control,
    name: "stops",
  });

  const handleAppendStop = () => {
    const newIndex = stopFields.length;
    appendStop(emptyStop());
    setAddressTypes(prev => ({
      ...prev,
      [newIndex]: ADDRESS_AUTOCOMPLETE_TYPES.establishment
    }));
  };

  const handleRemoveStop = (index) => {
    removeStop(index);
    setAddressTypes(prev => {
      const newTypes = {...prev};
      delete newTypes[index];
      // Reindex remaining stops
      const reindexed = {};
      Object.keys(newTypes).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
          reindexed[numKey - 1] = newTypes[key];
        } else {
          reindexed[key] = newTypes[key];
        }
      });
      return reindexed;
    });
  };

  const [fileToGuidMap, setFileToGuidMap] = useState({});
  const [defaultPhotos, setDefaultPhotos] = useState([]);
  const [addressTypes, setAddressTypes] = useState(
    stopFields.reduce((acc, field, index) => {
      acc[index] = ADDRESS_AUTOCOMPLETE_TYPES.establishment;
      return acc;
    }, {})
  );

  useEffect(() => {
    const callback = async () => {
      if (defaultValues.photos.length !== 0) {
        setDefaultPhotos(await Promise.all(defaultValues.photos.map(async key => {
          const { data, filename, contentType, size, uniqueId } = await downloadFile(key);
          return { blob: data, name: filename, type: contentType, size, id: uniqueId };
        })));
      }
    };

    callback();
  }, [defaultValues]);

  const [validated, setValidated] = useState(false);
  useEffect(() => {
    setValidated(isValid);
  }, [isValid, errors]);

  const [formValues, setFormValues] = useState(defaultValues);
  useEffect(() => {
    const subscription = formWatch((form) => {
      setFormValues(form);
    });
    return () => subscription.unsubscribe();
  }, [formWatch]);

  // Helper to batch update stop address fields without repeating setValue chains
  const applyAddress = (index, partial) => {
    Object.entries(partial).forEach(([key, val]) => {
      setValue(`stops.${index}.address.${key}`, val ?? "");
    });
  };

  return (
    <Form className="needs-validation" noValidate validated={validated}>
      <FormGroup className="mb-3" controlId="description">
        <Form.Label column="md" className="mb-2 text-muted">Description</Form.Label>
        <Form.Control
          type="text"
          isInvalid={!!errors.description}
          className={classNames("form-control", {
            "is-invalid": errors.description,
          })}
          autoComplete="on"
          {...formRegister("description")}
        />
        <Form.Text className="text-muted">
          Short description about your 1-day journey
        </Form.Text>
        {errors.description ? (
          <Form.Control.Feedback type="invalid">
            {errors.description.message}
          </Form.Control.Feedback>
        ) : null}
      </FormGroup>

      <FormGroup className="mb-3" controlId="email">
        <Form.Label column="md" className="mb-2 text-muted">Email</Form.Label>
        <Form.Control
          type="email"
          isInvalid={!!errors.email}
          className={classNames("form-control", {
            "is-invalid": errors.email,
          })}
          autoComplete="on"
          {...formRegister("email")}
        />
        <Form.Text className="text-muted">
          Email for spam-filtering purposes
        </Form.Text>
        {errors.email ? (
          <Form.Control.Feedback type="invalid">
            {errors.email.message}
          </Form.Control.Feedback>
        ) : null}
      </FormGroup>

      <FormGroup className="mb-3" controlId="date">
        <Form.Label column="md" className="mb-2 text-muted">Date</Form.Label>
        <DatetimePicker
          isInvalid={!!errors.date}
          value={formValues.date}
          onChange={(dt) => {
            setValue("date", dt ? dt.toISOString() : "");
          }}
          datePicker={true}
          timePicker={false}
        />
        <Form.Text className="text-muted">
          Approximate date of your journey
        </Form.Text>
        {errors.date ? (
          <Form.Control.Feedback type="invalid" className='d-block'>
            {errors.date.message}
          </Form.Control.Feedback>
        ) : null}
      </FormGroup>

      <DndContext
        sensors={useSensors(
          useSensor(PointerSensor, {
            activationConstraint: {distance: 8},
          }),
          useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
          }),
        )}
        onDragEnd={({active, over}) => {
          if (!over || active.id === over.id) return;
          const from = stopFields.findIndex((f) => f.id === active.id);
          const to = stopFields.findIndex((f) => f.id === over.id);
          if (from !== -1 && to !== -1) {
            move(from, to);
          }
        }}>
        <SortableContext
          items={stopFields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}>
          {stopFields.map((field, index) => {
            const stopErrors = errors?.stops?.[index] || {};
            const addressErrors = stopErrors?.address || {};

            return (
              <SortableStop key={field.id} id={field.id}>
                {({attributes, listeners}) => (
                  <div className="p-3 mb-4 border rounded">
                    <div className="mb-3">
                      <FormGroup controlId={`stops.${index}.description`} className="m-0">
                        <Form.Label className="mb-2 text-muted fw-semibold">
                          Stop #{index + 1} Description
                        </Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="text"
                            isInvalid={!!stopErrors?.description}
                            className={classNames("form-control", {
                              "is-invalid": stopErrors?.description,
                            })}
                            {...formRegister(`stops.${index}.description`)}
                          />
                          <SimpleButton
                            tooltip="Re-order stops"
                            className={classNames('btn-secondary d-none align-items-center justify-content-center ms-2', { 'd-md-inline-flex': stopFields.length > 1 })}
                            aria-label="Drag to reorder"
                            style={{
                              width: "38px",
                              height: "38px",
                              lineHeight: "normal",
                              padding: 0,
                              cursor: "grab",
                            }}
                            {...attributes}
                            {...listeners}>
                            <GoogleIcon
                              icon="drag_indicator"
                              style={{fontSize: "18px"}}
                            />
                          </SimpleButton>
                        </div>
                      </FormGroup>
                      {stopErrors?.description ? (
                        <Form.Control.Feedback type="invalid" className='d-block'>
                          {stopErrors.description.message}
                        </Form.Control.Feedback>
                      ) : null}
                    </div>
                    <FormGroup className="mb-3" controlId={`stops.${index}.address.name`}>
                      <Form.Label column="md" className="mb-2 text-muted d-flex justify-content-between align-items-center">
                        <span>Address</span>
                        <Button 
                          size="sm" 
                          variant={addressTypes[index] === ADDRESS_AUTOCOMPLETE_TYPES.establishment ? "primary" : "secondary"}
                          onClick={() => {
                            setAddressTypes(prev => ({
                              ...prev,
                              [index]: prev[index] === ADDRESS_AUTOCOMPLETE_TYPES.establishment ? ADDRESS_AUTOCOMPLETE_TYPES.address : ADDRESS_AUTOCOMPLETE_TYPES.establishment
                            }));
                          }}
                        >
                          {addressTypes[index] === ADDRESS_AUTOCOMPLETE_TYPES.establishment ? "🏢 Establishment" : "📍 Address"}
                        </Button>
                      </Form.Label>
                      <AddressAutoComplete
                        id={`address-autocomplete-${index}`}
                        isInvalid={!!addressErrors.name}
                        defaultValue={_.get(formValues, `stops.${index}.address.name`)}
                        placeholder={`Start typing ${addressTypes[index] === ADDRESS_AUTOCOMPLETE_TYPES.establishment ? "an establishment" : "an address"}`}
                        types={[addressTypes[index] || ADDRESS_AUTOCOMPLETE_TYPES.establishment]}
                        onSelect={({
                          name,
                          input,
                          city,
                          zipCode,
                          addressLine1,
                          addressLine2,
                          longitude,
                          latitude,
                          state,
                          country,
                        }) => {
                          applyAddress(index, {
                            name: name || input || "",
                            addressLine1,
                            addressLine2,
                            city,
                            zipCode,
                            latitude,
                            longitude,
                            state,
                            country
                          });
                        }}
                        onEmptySelect={(input) => {
                          applyAddress(index, {
                            name: input || "",
                            addressLine1: "",
                            addressLine2: "",
                            city: "",
                            zipCode: "",
                            latitude: "",
                            longitude: "",
                            state: "",
                            country: ""
                          });
                        }}
                      />
                      <Form.Text className="text-muted">
                        {addressTypes[index] === "establishment" ? "Establishment name" : "Street address"}
                      </Form.Text>
                      { addressErrors?.name ? <Form.Control.Feedback type='invalid' className='d-block'>
                        {addressErrors?.name?.message}
                      </Form.Control.Feedback> : null }
                    </FormGroup>
                    <div className="d-flex justify-content-end">
                      <LoadingSimpleButton className={classNames('btn-danger', { 'd-none': stopFields.length <= 1})} onClick={() => handleRemoveStop(index)}>
                        Remove Stop
                      </LoadingSimpleButton>
                    </div>
                  </div>
                )}
              </SortableStop>
            );
          })}
        </SortableContext>
      </DndContext>

      {errors?.stops && !stopFields.length ? (
        <div className="mb-3">
          <Form.Control isInvalid={true} hidden />
          <Form.Control.Feedback
            type="invalid"
            style={{display: "block"}}>
            {errors.stops.message || "At least one stop is required"}
          </Form.Control.Feedback>
        </div>
      ) : null}

      <div className="mb-4">
        <LoadingSimpleButton className="btn-primary" onClick={handleAppendStop}>
          Add Stop
        </LoadingSimpleButton>
      </div>

      <Form.Group className="mb-3" controlId="photos">
        <Form.Label>Photos (optional)</Form.Label>
        <FileUpload
          multiple={true}
          accepts={["image"]}
          defaultValue={defaultPhotos}
          onRemoveFile={file => {
            const updatedFileToGuidMap = _.omit(fileToGuidMap, [file.id]);
            setFileToGuidMap(updatedFileToGuidMap);
            setValue("photos", _.values(updatedFileToGuidMap));
          }}
          onDropHandler={async files => {
            const updatedFileToGuidMap = { ...fileToGuidMap };
            const keys = await Promise.all(files.map(async (file) => {
              const { data: key } = await uploadFile(file, 'Journey photo upload');
              updatedFileToGuidMap[file.id] = key;
              return key;
            }));

            setValue("photos", keys);
            setFileToGuidMap(updatedFileToGuidMap);
          }}/>
        <Form.Text className="text-muted">
          Photos of journey
        </Form.Text>
      </Form.Group>

      {renderSubmit(handleSubmit)}
    </Form>
  );
};
