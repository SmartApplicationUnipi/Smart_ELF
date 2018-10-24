//------------------------------------------------------------------------------
// <auto-generated />
//
// This file was automatically generated by SWIG (http://www.swig.org).
// Version 3.0.12
//
// Do not make changes to this file unless you know what you are doing--modify
// the SWIG interface file instead.
//------------------------------------------------------------------------------


public class ImageRgba : Image {
  private global::System.Runtime.InteropServices.HandleRef swigCPtr;

  internal ImageRgba(global::System.IntPtr cPtr, bool cMemoryOwn) : base(yarpPINVOKE.ImageRgba_SWIGUpcast(cPtr), cMemoryOwn) {
    swigCPtr = new global::System.Runtime.InteropServices.HandleRef(this, cPtr);
  }

  internal static global::System.Runtime.InteropServices.HandleRef getCPtr(ImageRgba obj) {
    return (obj == null) ? new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero) : obj.swigCPtr;
  }

  ~ImageRgba() {
    Dispose();
  }

  public override void Dispose() {
    lock(this) {
      if (swigCPtr.Handle != global::System.IntPtr.Zero) {
        if (swigCMemOwn) {
          swigCMemOwn = false;
          yarpPINVOKE.delete_ImageRgba(swigCPtr);
        }
        swigCPtr = new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero);
      }
      global::System.GC.SuppressFinalize(this);
      base.Dispose();
    }
  }

  public ImageRgba() : this(yarpPINVOKE.new_ImageRgba(), true) {
  }

  public override uint getPixelSize() {
    uint ret = yarpPINVOKE.ImageRgba_getPixelSize(swigCPtr);
    return ret;
  }

  public override int getPixelCode() {
    int ret = yarpPINVOKE.ImageRgba_getPixelCode(swigCPtr);
    return ret;
  }

  public PixelRgba pixel(uint x, uint y) {
    PixelRgba ret = new PixelRgba(yarpPINVOKE.ImageRgba_pixel__SWIG_0(swigCPtr, x, y), false);
    return ret;
  }

  public PixelRgba access(uint x, uint y) {
    PixelRgba ret = new PixelRgba(yarpPINVOKE.ImageRgba_access__SWIG_0(swigCPtr, x, y), false);
    return ret;
  }

  public PixelRgba safePixel(uint x, uint y) {
    PixelRgba ret = new PixelRgba(yarpPINVOKE.ImageRgba_safePixel__SWIG_0(swigCPtr, x, y), false);
    return ret;
  }

}
