import React, { useState } from 'react'
import { useFormik } from 'formik'
import { useMutation } from '@tanstack/react-query'
import Input from '../components/form-controls/Input'
import Select from '../components/form-controls/select'
import { blendSchema } from '../validations/blendSchema'
import { initRequest } from '../client/api'
import { useNavigate } from 'react-router-dom'

const Blend = () => {
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const { mutate, isPending, } = useMutation({
        mutationFn: initRequest,
        onSuccess: ({ data: { id } }) => navigate(`/createion/${id}`),
    });
    const approachOptions = [
        {
            value: 'sidebar',
            label: 'Sidebar'
        },
        // {
        //     value: 'background',
        //     label: 'Background'
        // },
        {
            value: 'voice',
            label: 'Voice'
        }
    ];
    const formik = useFormik({
        initialValues: {
            brandName: '',
            brandType: '',
            brandDescription: '',
            youtubeVideoLink: '',
            approach: 'sidebar',
            logo: null,
        },
        validationSchema: blendSchema,
        onSubmit: mutate
    })

    return (
        <main>
            <section id="hero" class="row mx-0">
                <div class="col-12 col-sm-6">
                    <h2 className='mb-4'>Let the Kawwa know about Your Story<span class="colr-dot">!</span></h2>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="row">
                            <Input
                                name="brandName"
                                onChange={formik.handleChange}
                                value={formik.values.brandName}
                                placeholder="eg. earbuds pro"
                                outerClassName='col-8 mb-3'
                                className="w-100"
                                label={{ text: 'What do you want to advertise?', props: { className: 'mb-3' } }}
                                error={{ text: formik.errors.brandName, props: { className: 'text-danger' } }}
                            />

                            <Input
                                name="brandType"
                                onChange={formik.handleChange}
                                value={formik.values.brandType}
                                placeholder="Mobile Accessories"
                                outerClassName='col-4 mb-3'
                                className="w-100"
                                label={{ text: 'Industry', props: { className: 'mb-3' } }}
                                error={{ text: formik.errors.brandType, props: { className: 'text-danger' } }}
                            />

                        </div>
                        <Input
                            name="brandDescription"
                            onChange={formik.handleChange}
                            value={formik.values.brandDescription}
                            type="textarea"
                            rows="10"
                            className="w-100"
                            placeholder="“earbuds pro” wireless earphones are all about awesome sound on a budget. You'll love the crystal-clear audio and comfy fit for hours of music enjoyment."
                            label={{ text: 'Provide description of your offering.', props: { className: 'mb-3' } }}
                            help={{ text: "To achieve optimal results, ensure that there are no grammar mistakes.", props: { className: 'green' } }}
                            error={{ text: formik.errors.brandDescription, props: { className: 'text-danger' } }}
                        />


                        <Input
                            onChange={(e) => {
                                setFile(e.target.files)
                                formik.setFieldValue('logo', e.target.files[0])
                            }}
                            value={file}
                            type="file"
                            accept="image/png"
                            className="d-block ol-btn-sm mb-2 px-5"
                            help={{ text: "eg, you can upload your brand logo, brand icon, monogram etc.", props: { className: 'text-secondary' } }}
                            error={{ text: formik.errors.logo, props: { className: 'text-danger' } }}
                        />

                        <div className='row align-items-center'>
                            <Input
                                name="youtubeVideoLink"
                                onChange={formik.handleChange}
                                value={formik.values.youtubeVideoLink}
                                className="w-100"
                                outerClassName='col-lg-8 col-7 mb-3'
                                placeholder="https://www.youtube.com/watch?v=iF6L0mB1bEA"
                                label={{ text: 'YouTube video link.', props: { className: 'mb-3' } }}
                                error={{ text: formik.errors.youtubeVideoLink, props: { className: 'text-danger' } }}
                            />
                            <button
                                type='button'
                                onClick={() => {
                                    navigator.clipboard.readText().then(text => {
                                        formik.setFieldValue('youtubeVideoLink', text);
                                    })
                                }}
                                className='ol-btn-sm col-lg-3 col-5 py-3 mt-1'
                            >
                                Paste Link
                            </button>
                        </div>

                        <Select
                            name="approach"
                            onChange={formik.handleChange}
                            value={formik.values.approach}
                            className="w-100"
                            label={{ text: "Approach", props: { className: 'mb-3' } }}
                            error={{ text: formik.errors.approach, props: { className: 'text-danger' } }}
                            options={approachOptions} />

                        <button disabled={isPending} className='w-100 py-3' type='submit'>{isPending ? "Starting Blending..." : "Blend"}</button>
                    </form>
                </div>
                <div class="col-12 col-sm-6 d-none d-sm-block">
                    <img className='d-block' src="/kawwa.svg" alt="Kawwa" style={{
                        marginLeft: 'auto',
                    }} />
                </div>
            </section></main>
    )
}

export default Blend